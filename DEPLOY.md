# Deploy: front na Vercel, back numa VM Oracle

```
navegador ──HTTPS──> Vercel (build estático do Vite)
    └─────HTTPS/WSS──> VM Oracle: Caddy :443 ──> Node :3001 (Express + Socket.IO)
```

O back **precisa de HTTPS**: a Vercel serve o site em HTTPS e o navegador bloqueia
chamadas para `http://` e `ws://` vindas de uma página HTTPS (mixed content).
O Caddy cuida disso sozinho com certificado Let's Encrypt — só precisa de um nome de domínio.

**Sem domínio?** Use `IP-COM-TRACOS.sslip.io` (ex.: VM `129.146.10.20` → `129-146-10-20.sslip.io`).
Resolve para o IP da VM e funciona com Let's Encrypt.

Antes de tudo, suba o projeto para um repositório no GitHub (a Vercel e a VM puxam de lá).

---

## 1. VM Oracle (Ubuntu 22.04/24.04)

### 1.1 Liberar portas 80 e 443
No console da Oracle: **Networking → Virtual Cloud Networks → sua VCN → Security Lists → Default →
Add Ingress Rules**: source `0.0.0.0/0`, TCP, destination port `80`; repita para `443`.

As imagens Ubuntu da Oracle também bloqueiam no iptables da própria VM:

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

(Não abra a 3001 — só o Caddy fala com o Node.)

### 1.2 Instalar Node 22, git e Caddy

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git caddy
```

(`caddy` está no repositório do Ubuntu 24.04. No 22.04, siga https://caddyserver.com/docs/install#debian-ubuntu-raspbian.)

### 1.3 Código

```bash
cd ~
git clone https://github.com/SEU-USUARIO/tictactoe4x4.git
cd tictactoe4x4
npm ci --omit=dev   # só express + socket.io; libs do front são devDependencies
```

### 1.4 Serviço (sobe no boot e reinicia se cair)

Edite `deploy/tictactoe.service`: troque `CORS_ORIGIN` pela URL da Vercel
(várias separadas por vírgula, ex.: domínio próprio + `*.vercel.app` específico). Confira `User` e `WorkingDirectory`.

```bash
sudo cp deploy/tictactoe.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now tictactoe
curl localhost:3001/api/stats    # deve responder {"rooms":0,"online":0}
```

### 1.5 HTTPS com Caddy

Edite `deploy/Caddyfile` com seu domínio (ou o `sslip.io`) e:

```bash
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Teste de fora: `https://api.seudominio.com/api/stats`.

---

## 2. Vercel

1. **Add New → Project**, importe o repositório. Framework: **Vite** (detectado).
   Build `npm run build`, output `dist` — já são os padrões.
2. **Environment Variables**: `VITE_API_URL` = `https://api.seudominio.com` (sem barra no final).
3. Deploy. O `vercel.json` já redireciona as rotas (`/room/ABC12`, `/local`…) para o `index.html`.

`VITE_API_URL` é embutida no build: se mudar, faça **Redeploy**.

Se a URL final da Vercel for diferente da que pôs no `CORS_ORIGIN`, ajuste o serviço e
`sudo systemctl restart tictactoe`.

---

## Atualizar depois

- **Front:** `git push` → a Vercel faz o deploy sozinha.
- **Back:**
  ```bash
  cd ~/tictactoe4x4 && git pull && npm ci --omit=dev && sudo systemctl restart tictactoe
  ```
  Reiniciar apaga as salas abertas (ficam em memória). Os clientes reconectam, mas recebem "Sala não encontrada".

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Console: `blocked by CORS policy` | `CORS_ORIGIN` diferente da URL exata da Vercel (com `https://`, sem barra) |
| Console: `Mixed Content` | `VITE_API_URL` com `http://` — tem que ser `https://` |
| Caddy não emite certificado | portas 80/443 fechadas (Security List **e** iptables) ou DNS não aponta para a VM |
| Logs do back | `journalctl -u tictactoe -f` |
