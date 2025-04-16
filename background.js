// Initialize when extension is installed
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.get('compactMode', function(data) {
      if (data.compactMode === undefined) {
        chrome.storage.sync.set({ compactMode: false });
      }
    });
  });
  
  // 改进: 更好地处理页面加载和导航事件
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // 当页面完成加载并且URL包含overleaf.com时
    if (tab.url && tab.url.includes('overleaf.com')) {
      // 对于页面状态变化时都尝试应用设置
      chrome.storage.sync.get('compactMode', function(data) {
        // 只在有状态变化且状态为true时发送消息
        if (data.compactMode) {
          chrome.tabs.sendMessage(tabId, { 
            action: 'toggleCompactMode',
            compactMode: true
          }, function(response) {
            // 处理可能的错误（如content script尚未加载）
            const lastError = chrome.runtime.lastError;
            if (lastError && changeInfo.status === 'complete') {
              // 如果是完全加载并且消息发送失败，则尝试注入content script
              chrome.scripting.executeScript({
                target: { tabId: tabId },
                function: injectCompactMode
              });
            }
          });
        }
      });
    }
  });
  
  // 用于在脚本注入时立即应用紧凑模式的辅助函数
  function injectCompactMode() {
    const toolbarHeaders = document.querySelectorAll('.toolbar-header');
    const cmPanelsTop = document.querySelectorAll('.cm-panels-top');
    const toolbarPdf = document.querySelectorAll('.toolbar-pdf');
    const pdfViewer = document.querySelector('.pdf-viewer');
    
    toolbarHeaders.forEach(el => el.style.display = 'none');
    cmPanelsTop.forEach(el => el.style.display = 'none');
    toolbarPdf.forEach(el => el.style.display = 'none');
    
    if (pdfViewer) {
      pdfViewer.style.marginTop = '-32px';
    }
  }