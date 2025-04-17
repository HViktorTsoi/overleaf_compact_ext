document.addEventListener('DOMContentLoaded', function() {
  const compactModeToggle = document.getElementById('compact-mode');
  const recompileButton = document.getElementById('recompile-button');
  
  // Load saved state
  chrome.storage.sync.get('compactMode', function(data) {
    compactModeToggle.checked = data.compactMode || false;
  });
  
  // Toggle compact mode when checkbox is clicked
  compactModeToggle.addEventListener('change', function() {
    const isCompactMode = compactModeToggle.checked;
    
    // Save state
    chrome.storage.sync.set({ compactMode: isCompactMode });
    
    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'toggleCompactMode',
          compactMode: isCompactMode
        });
      }
    });
  });
  
  // 新增: Recompile 按钮点击事件
  recompileButton.addEventListener('click', function() {
    // 禁用按钮
    recompileButton.disabled = true;
    
    // 向content script发送recompile消息
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'recompile' });
        
        // 2秒后重新启用按钮
        setTimeout(function() {
          recompileButton.disabled = false;
        }, 5000);
      } else {
        // 如果没有活动标签页，也要重新启用按钮
        recompileButton.disabled = false;
      }
    });
  });
  
  // 监听来自background.js的状态更新消息
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updatePopupState') {
      // 更新switch状态
      compactModeToggle.checked = request.compactMode;
      
      // 确认已处理消息
      sendResponse({ success: true });
    }
    return true;
  });
});