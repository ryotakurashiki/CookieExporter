document.getElementById('export-button').addEventListener('click', async () => {
    const domain = document.getElementById('domain-input').value.trim();
    const statusEl = document.getElementById('status');
    statusEl.textContent = '';
    
    if (!domain) {
      statusEl.textContent = 'Please enter a domain.';
      return;
    }
  
    try {
      // "domain"で指定したドメインに該当するクッキーを取得
      const cookies = await chrome.cookies.getAll({ domain });
      if (!cookies || cookies.length === 0) {
        statusEl.textContent = `No cookies found for ${domain}.`;
        return;
      }
  
      // Puppeteer形式への変換処理
      // PuppeteerのsetCookie形式: [{name, value, domain, path, expires, httpOnly, secure, sameSite}, ...]
      const puppeteerCookies = cookies.map(c => {
        return {
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: c.path,
          expires: c.expirationDate ? Math.floor(c.expirationDate) : 0,
          httpOnly: c.httpOnly,
          secure: c.secure,
          sameSite: c.sameSite === 'no_restriction' ? 'None' : 
                    c.sameSite === 'lax' ? 'Lax' : 
                    c.sameSite === 'strict' ? 'Strict' : 'None' 
        };
      });
  
      // JSON生成
      const jsonStr = JSON.stringify(puppeteerCookies, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
  
      // ダウンロード用リンクを作成し、自動でクリック
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `${domain}_cookies.json`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
  
      statusEl.textContent = `Exported ${puppeteerCookies.length} cookies from ${domain}.`;
    } catch (err) {
      console.error(err);
      statusEl.textContent = `Error: ${err.message}`;
    }
  });