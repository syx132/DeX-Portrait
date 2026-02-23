document.addEventListener('DOMContentLoaded', function() {
  const copyBtn = document.getElementById('copyCitationBtn');
  const citationCode = document.getElementById('citationCode');

  function copyCitationText() {
    const citationText = citationCode.textContent.trim();
    
    try {
      navigator.clipboard.writeText(citationText).then(() => {
        showCopySuccess();
      }).catch(() => {
        fallbackCopyTextToClipboard(citationText);
      });
    } catch (err) {
      fallbackCopyTextToClipboard(citationText);
    }
  }

  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      showCopySuccess();
    } catch (err) {
      alert('Copy failed!');
    }
    
    document.body.removeChild(textArea);
  }

  function showCopySuccess() {
    const originalText = copyBtn.textContent;
    copyBtn.classList.add('success');
    copyBtn.textContent = 'Copied!';
    
    setTimeout(() => {
      copyBtn.classList.remove('success');
      copyBtn.textContent = originalText;
    }, 2000);
  }

  copyBtn.addEventListener('click', copyCitationText);
});