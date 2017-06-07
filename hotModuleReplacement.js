module.exports = function(compilationHash, publicPath, outputFilename) {
  if (document) {
    var origin = document.location.protocol + '//' + document.location.hostname + (document.location.port ? ':' + document.location.port: '');
    var styleSheets = document.getElementsByTagName('link');
    for (var i = 0; i < styleSheets.length; i++) {
      if (styleSheets[i].href) {
        var hrefUrl = styleSheets[i].href.split('?');
        var href = hrefUrl[0];
        var hash = hrefUrl[1];
        if (hash !== compilationHash && href === origin + publicPath + outputFilename) {
          var url = href + '?' + compilationHash;
          styleSheets[i].href = url;
          console.log('[HMR]', 'Reload css: ', url);
          break;
        }
      }
    }
  }
}
