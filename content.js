let compactModeEnabled = false;

// Function to toggle compact mode
function toggleCompactMode(enabled) {
  compactModeEnabled = enabled;
  
  const toolbarHeaders = document.querySelectorAll('.toolbar-header');
  const cmPanelsTop = document.querySelectorAll('.cm-panels-top');
  const pdfViewer = document.querySelector('.pdf-viewer');
  const toolbarPdf = document.querySelectorAll('.toolbar-pdf'); // 处理 toolbar-pdf 元素
  
  if (enabled) {
    // Apply compact mode
    toolbarHeaders.forEach(el => {
      el.style.display = 'none';
    });
    
    cmPanelsTop.forEach(el => {
      el.style.display = 'none';
    });
    
    // 隐藏 toolbar-pdf 元素
    toolbarPdf.forEach(el => {
      el.style.display = 'none';
    });
    
    if (pdfViewer) {
      pdfViewer.style.marginTop = '-32px';
    }
  } else {
    // Remove compact mode
    toolbarHeaders.forEach(el => {
      el.style.display = '';
    });
    
    cmPanelsTop.forEach(el => {
      el.style.display = '';
    });
    
    // 显示 toolbar-pdf 元素
    toolbarPdf.forEach(el => {
      el.style.display = '';
    });
    
    if (pdfViewer) {
      pdfViewer.style.marginTop = '';
    }
  }
}

// 新增: 重新编译文档
function recompileDocument() {
  try {
    const recompileButton = document.getElementsByClassName('d-inline-grid align-items-center py-0 no-left-radius px-3 btn btn-primary')[0];
    if (recompileButton) {
      recompileButton.click();
      console.log('Recompile button clicked successfully');
      return true;
    } else {
      console.error('Recompile button not found');
      return false;
    }
  } catch (error) {
    console.error('Error while trying to recompile:', error);
    return false;
  }
}

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleCompactMode') {
    toggleCompactMode(request.compactMode);
    sendResponse({ success: true });
  } else if (request.action === 'getCompactModeStatus') {
    sendResponse({ compactMode: compactModeEnabled });
  } else if (request.action === 'recompile') {
    // 新增: 处理重新编译请求
    const success = recompileDocument();
    sendResponse({ success: success });
  }
  return true;
});

// 确保页面加载完成后应用存储设置
function applyStoredSettings() {
  chrome.storage.sync.get('compactMode', function(data) {
    if (data.compactMode) {
      toggleCompactMode(true);
    }
  });
}

// 立即执行一次，以应对页面已经加载的情况
applyStoredSettings();

// 当DOM内容加载完成时再次尝试应用设置
document.addEventListener('DOMContentLoaded', applyStoredSettings);

// 当页面完全加载时再次尝试应用设置（包括图片等资源）
window.addEventListener('load', applyStoredSettings);

// 应用 MutationObserver 来监听DOM变化
const observer = new MutationObserver(function(mutations) {
  if (compactModeEnabled) {
    // 当DOM变化时，确保我们的设置仍然被应用
    const toolbarHeaders = document.querySelectorAll('.toolbar-header');
    const cmPanelsTop = document.querySelectorAll('.cm-panels-top');
    const toolbarPdf = document.querySelectorAll('.toolbar-pdf');
    
    toolbarHeaders.forEach(el => {
      if (el.style.display !== 'none') {
        el.style.display = 'none';
      }
    });
    
    cmPanelsTop.forEach(el => {
      if (el.style.display !== 'none') {
        el.style.display = 'none';
      }
    });
    
    toolbarPdf.forEach(el => {
      if (el.style.display !== 'none') {
        el.style.display = 'none';
      }
    });
    
    const pdfViewer = document.querySelector('.pdf-viewer');
    if (pdfViewer && pdfViewer.style.marginTop !== '-32px') {
      pdfViewer.style.marginTop = '-32px';
    }
  }
});

// 开始监听DOM变化
observer.observe(document.body, { 
  childList: true, 
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'style']
});