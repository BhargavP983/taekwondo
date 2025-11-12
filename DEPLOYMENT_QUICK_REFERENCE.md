# 🚀 Quick Deployment Reference Card

## One-Command Deployment

### From Windows (Recommended)
```powershell
cd "X:\Web Dev\Gemini\-taekwondo"
.\deploy.ps1
```

### From VPS (Direct)
```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

---

## 📋 Pre-Deployment Checklist

- [ ] Ubuntu VPS (20.04 or 22.04)
- [ ] SSH access configured
- [ ] VPS IP address ready
- [ ] GitHub repository accessible
- [ ] 2-3 MongoDB passwords ready
- [ ] ⚠️ **Node.js v24.11.1+ LTS required** (see updated deployment scripts)

---

## ⚡ What Happens During Deployment

| Step | Action | Time | Retry |
|------|--------|------|-------|
| 1 | System update | 2-5 min | ✅ |
| 2 | Install Node.js v24 LTS | 1-2 min | ✅ |
| 3 | Install MongoDB v7.0 | 2-3 min | ✅ |
| 4 | Configure MongoDB users | 1 min | ⚠️ |
| 5 | Install PM2 | 30 sec | ✅ |
| 6 | Install Nginx | 1 min | ✅ |
| 7 | Configure firewall | 30 sec | ❌ |
| 8 | Clone application | 1-2 min | ✅ |
| 9 | Setup backend | 3-5 min | ✅ |
| 10 | Setup frontend | 3-5 min | ✅ |
| 11 | Start with PM2 | 30 sec | ✅ |
| 12 | Configure Nginx | 1 min | ❌ |
| 13 | Setup backups | 30 sec | ❌ |

**Total Time:** 15-25 minutes

---

## 🔍 Quick Status Check Commands

```bash
# All-in-one status check
pm2 status && sudo systemctl status nginx --no-pager && sudo systemctl status mongod --no-pager

# Backend logs (live)
pm2 logs taekwondo-backend

# Test backend API
curl http://localhost:5000/api/health

# Test frontend
curl http://localhost | head -20

# Check disk space
df -h

# Check memory
free -h
```

---

## 🔧 Quick Fix Commands

### Backend Not Starting
```bash
cd /home/deploy/apps/-taekwondo/backend
pm2 logs taekwondo-backend --lines 50  # Check error
npm run build                          # Rebuild if needed
pm2 restart taekwondo-backend          # Restart
```

### Frontend Not Loading
```bash
cd /home/deploy/apps/-taekwondo/frontend
npm run build                          # Rebuild
sudo systemctl restart nginx           # Restart Nginx
```

### MongoDB Connection Issues
```bash
sudo systemctl status mongod           # Check MongoDB
mongosh -u admin -p --authenticationDatabase admin  # Test connection
```

### 502 Bad Gateway
```bash
pm2 restart taekwondo-backend          # Restart backend
sudo systemctl restart nginx           # Restart Nginx
curl http://localhost:5000/api/health  # Test API
```

### Disk Space Full
```bash
df -h                                  # Check space
pm2 flush                              # Clear PM2 logs
sudo journalctl --vacuum-time=7d       # Clear system logs
```

---

## 🔄 Quick Update Commands

```bash
# Update everything
cd /home/deploy/apps/-taekwondo
git pull origin main
cd backend && npm install && npm run build && pm2 restart taekwondo-backend
cd ../frontend && npm install && npm run build && sudo systemctl reload nginx
```

---

## 📊 Resource Requirements

| Component | CPU | RAM | Disk |
|-----------|-----|-----|------|
| Node.js | 10% | 100 MB | 200 MB |
| Backend (PM2 x2) | 20% | 400 MB | 500 MB |
| Frontend (Nginx) | 5% | 50 MB | 100 MB |
| MongoDB | 15% | 200 MB | 1-5 GB |
| **Total** | **50%** | **750 MB** | **2-6 GB** |

**Recommended VPS:** 1 CPU, 2GB RAM, 20GB SSD

---

## 🎯 Access Points After Deployment

```
Frontend:    http://YOUR_VPS_IP
Backend API: http://YOUR_VPS_IP:5000
SSH:         ssh deploy@YOUR_VPS_IP
```

---

## 🆘 Emergency Recovery

### Complete Restart
```bash
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart mongod
```

### Nuclear Option (Reset Everything)
```bash
pm2 delete all
cd /home/deploy/apps
rm -rf -taekwondo
# Re-run deployment script
sudo ./deploy.sh
```

### Backup Before Nuclear Option
```bash
# Backup MongoDB
mongodump --uri="mongodb://taekwondo_user:PASSWORD@localhost:27017/ap-taekwondo" --out=/tmp/mongodb_backup

# Backup uploads
tar -czf /tmp/uploads_backup.tar.gz /home/deploy/apps/-taekwondo/backend/uploads/

# Backup .env files
cp /home/deploy/apps/-taekwondo/backend/.env /tmp/backend.env.backup
cp /home/deploy/apps/-taekwondo/frontend/.env.production /tmp/frontend.env.backup
```

---

## 📱 Useful PM2 Commands

```bash
pm2 status                             # Show all processes
pm2 logs                               # Show all logs (live)
pm2 logs taekwondo-backend --lines 100 # Last 100 lines
pm2 restart taekwondo-backend          # Restart backend
pm2 stop taekwondo-backend             # Stop backend
pm2 start taekwondo-backend            # Start backend
pm2 delete taekwondo-backend           # Remove from PM2
pm2 monit                              # Real-time monitoring
pm2 save                               # Save process list
pm2 flush                              # Clear all logs
```

---

## 🔐 Security Quick Check

```bash
# Check firewall status
sudo ufw status

# Check open ports
sudo ss -tulpn

# Check failed login attempts
sudo grep "Failed password" /var/log/auth.log | tail -20

# Check MongoDB authentication
mongosh -u admin -p --authenticationDatabase admin --eval "db.version()"
```

---

## 📞 When to Use Manual Deployment

Use manual deployment (UBUNTU_VPS_DEPLOYMENT.md) when:
- ❌ Automated script fails repeatedly
- ❌ Need custom configuration
- ❌ Different versions of Node/MongoDB needed
- ❌ Special security requirements
- ❌ Learning the deployment process

---

## 💡 Pro Tips

1. **Always test locally first:** `npm run build` should work before deploying
2. **Keep .env files backed up:** Copy them before nuclear options
3. **Monitor PM2 startup:** Run `pm2 startup` to enable auto-restart on reboot
4. **Check logs regularly:** `pm2 logs` shows real-time issues
5. **Use screen/tmux:** For long-running commands, use `screen -S deploy` then `./deploy.sh`
6. **Git conflicts:** Use `git stash` before `git pull`, then `git stash pop`
7. **Permissions matter:** Backend uploads need write permissions: `chmod -R 755 uploads/`

---

## 🎓 Learning Path

1. **First deployment:** Use automated script (deploy.ps1)
2. **Understand what happened:** Read AUTOMATED_DEPLOYMENT.md
3. **Deep dive:** Study UBUNTU_VPS_DEPLOYMENT.md
4. **Troubleshooting:** Refer to UBUNTU_VPS_DEPLOYMENT.md Part 5
5. **Optimization:** Learn PM2, Nginx, MongoDB configuration

---

## ✅ Success Indicators

After deployment, you should see:

```bash
pm2 status
# ┌─────┬────────────────────┬─────────┬─────────┬───────┬────────┐
# │ id  │ name               │ status  │ restart │ cpu   │ memory │
# ├─────┼────────────────────┼─────────┼─────────┼───────┼────────┤
# │ 0   │ taekwondo-backend  │ online  │ 0       │ 5%    │ 150 MB │
# │ 1   │ taekwondo-backend  │ online  │ 0       │ 5%    │ 150 MB │
# └─────┴────────────────────┴─────────┴─────────┴───────┴────────┘
```

```bash
curl http://localhost:5000/api/health
# {"status":"healthy","timestamp":"2025-11-11T..."}
```

```bash
curl -I http://localhost
# HTTP/1.1 200 OK
# Content-Type: text/html
```

---

**🎉 You're ready to deploy! Run `.\deploy.ps1` and follow the prompts.**
