// Initialize default state
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({ compactMode: false });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('overleaf.com')) {
    // Try to apply compact mode if it's enabled
    chrome.storage.sync.get('compactMode', function(data) {
      if (data.compactMode) {
        // First try messaging the content script
        chrome.tabs.sendMessage(tabId, { 
          action: 'toggleCompactMode', 
          compactMode: true 
        }, function(response) {
          // If messaging fails (e.g., content script not loaded yet),
          // inject the script to apply compact mode
          if (chrome.runtime.lastError) {
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              function: function() {
                const toolbarHeaders = document.querySelectorAll('.toolbar-header');
                const cmPanelsTop = document.querySelectorAll('.cm-panels-top');
                const pdfViewer = document.querySelector('.pdf-viewer');
                const toolbarPdf = document.querySelectorAll('.toolbar-pdf');
                
                toolbarHeaders.forEach(el => {
                  el.style.display = 'none';
                });
                
                cmPanelsTop.forEach(el => {
                  el.style.display = 'none';
                });
                
                toolbarPdf.forEach(el => {
                  el.style.display = 'none';
                });
                
                if (pdfViewer) {
                  pdfViewer.style.marginTop = '-32px';
                }
              }
            });
          }
        });
      }
    });
  }
});

// 监听快捷键命令
chrome.commands.onCommand.addListener(function(command) {
  if (command === "toggle-compact-mode") {
    // 获取当前激活的标签页
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('overleaf.com')) {
        // 获取当前的紧凑模式状态
        chrome.storage.sync.get('compactMode', function(data) {
          // 切换紧凑模式状态
          const newState = !data.compactMode;
          chrome.storage.sync.set({ compactMode: newState });
          
          // 发送消息到content脚本
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'toggleCompactMode', 
            compactMode: newState 
          });

          // 广播消息给所有打开的popup页面，更新UI状态
          chrome.runtime.sendMessage({ 
            action: 'updatePopupState', 
            compactMode: newState 
          });
        });
      }
    });
  }
});