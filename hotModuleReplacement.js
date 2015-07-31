function forceRedraw(element) {
    var n = document.createTextNode(' ');
    var visibility = element.style.visibility; 
    element.appendChild(n);
    element.style.visibility = 'hidden';
    setTimeout(function(){
        element.style.visibility = visibility;
        n.parentNode.removeChild(n);
    }, 20);
}

function replaceStylesheet(styleSheet, url) {
  // Wait until the extract module is complete
  styleSheet.href = url;
  setTimeout(function() {
    console.log('[HMR]', 'Reload css: ', url);
    forceRedraw(document.body);
  }, 100);
}

module.exports = function(compilationHash, outputFilename) {
  if (document) {
    var styleSheets = document.getElementsByTagName('link');
    for (var i = 0; i < styleSheets.length; i++) {
      if (styleSheets[i].href) {
        var hrefUrl = styleSheets[i].href.split('?');
        var href = hrefUrl[0];
        var hash = hrefUrl[1];
        if (hash !== compilationHash && href === document.location.origin + '/' + outputFilename) {
          replaceStylesheet(styleSheets[i], href + '?' + compilationHash);
          break;
        }
      }
    }
  }
}
