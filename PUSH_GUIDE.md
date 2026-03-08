# GitHub 推送指南

## 当前状态

✅ Git仓库已初始化  
✅ 代码已提交（commit c6f5c80）  
✅ 远程仓库已配置  
⏳ 需要推送代码到GitHub  

---

## 方法1：手动推送（推荐）

### 步骤1：打开终端
```bash
cd /home/wuying/clawd/projects/ai-fortune-h5
```

### 步骤2：配置Git用户信息（如果还没配置）
```bash
git config --global user.name "OpenClaw"
git config --global user.email "openclaw@clawd.ai"
```

### 步骤3：推送代码
```bash
git push -u origin main
```

如果提示输入用户名和密码，请输入你的GitHub用户名和Personal Access Token（不是密码）。

---

## 方法2：使用Personal Access Token（推荐）

### 步骤1：创建GitHub Token
1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成并复制Token

### 步骤2：配置远程仓库URL
```bash
cd /home/wuying/clawd/projects/ai-fortune-h5
git remote set-url origin https://<YOUR_TOKEN>@github.com/ghlat520/feishui.git
```

### 步骤3：推送
```bash
git push -u origin main
```

---

## 方法3：配置SSH Key

### 步骤1：生成SSH Key（如果还没有）
```bash
ssh-keygen -t ed25519 -C "openclaw@clawd.ai"
# 一路回车使用默认设置
```

### 步骤2：查看公钥
```bash
cat ~/.ssh/id_ed25519.pub
```

### 步骤3：添加到GitHub
1. 复制公钥内容
2. 访问：https://github.com/settings/keys
3. 点击 "New SSH key"
4. 粘贴公钥并保存

### 步骤4：推送
```bash
cd /home/wuying/clawd/projects/ai-fortune-h5
git remote set-url origin git@github.com:ghlat520/feishui.git
git push -u origin main
```

---

## 当前Git配置

**远程仓库：**  
```
origin  https://github.com/ghlat520/feishui.git (fetch)
origin  https://github.com/ghlat520/feishui.git (push)
```

**本地分支：** main  
**最新提交：** c6f5c80  
**待推送文件：** 20个文件，5091行代码

---

## 快速命令

```bash
# 查看状态
cd /home/wuying/clawd/projects/ai-fortune-h5
git status

# 查看远程仓库
git remote -v

# 查看提交历史
git log --oneline

# 推送代码
git push -u origin main
```

---

## 项目信息

**项目名称：** AI命运守护神  
**项目位置：** /home/wuying/clawd/projects/ai-fortune-h5  
**GitHub仓库：** https://github.com/ghlat520/feishui  
**分支：** main  
**提交ID：** c6f5c80  

---

## 如遇问题

### 问题1：Permission denied
**原因：** 没有推送权限  
**解决：** 
- 确认你有仓库的写入权限
- 使用正确的GitHub账号

### 问题2：Authentication failed
**原因：** 认证失败  
**解决：**
- 使用Personal Access Token而不是密码
- 检查Token权限是否包含repo

### 问题3：Host key verification failed
**原因：** SSH首次连接需要验证  
**解决：**
```bash
ssh-keyscan github.com >> ~/.ssh/known_hosts
```

---

**创建时间：** 2026-03-08 10:50  
**创建人：** OpenClaw 🦞
