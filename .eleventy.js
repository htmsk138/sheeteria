const isProduction = 'production' === process.env.ELEVENTY_ENV;
const htmlmin = require("html-minifier");

module.exports = function (eleventyConfig) {
  /**
   * Build songs data based on sheets data.
   */
  eleventyConfig.addCollection('songs', function(collectionApi) {
    var songs = {};
    collectionApi.items[0].data.sheeteria.forEach(function(sheet) {
      var songId = sheet.id.slice(0, 4);
      if (!songs[songId]) {
        songs[songId] = {};
        songs[songId].id = songId;
        songs[songId].title = sheet.title;
        songs[songId].artist = sheet.artist;
        songs[songId].sheetList = {};
      }
      songs[songId].sheetList[sheet.id.slice(5, 7)] = sheet.style;
    });

    return Object.values(songs);
  });

  /**
   * Convert sheet id for shortened URL.
   * It's "song ID without leading zeros" + "-" + "variation ID without leading zeros" (e.g. 0003-01 -> 3-1)
   */
  eleventyConfig.addFilter('shortslug', function(id) {
    return id.replace(/^0+/, '').replace(/-0?/, '-');
  });

  /**
   * Generate filter slug based on text passed on.
   */
  eleventyConfig.addFilter('sheetFilter', function(text) {
    switch(text.toLowerCase()) {
      case 'lead sheet':
        return 'lead-sheet';

      case 'easy piano':
        return 'easy-piano';
    }

    return 'piano-solo';
  });

  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if(isProduction && outputPath.endsWith(".html")) {
      return htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyJS: true
      });
    }

    return content;
  });
 
  if (!isProduction) {
    eleventyConfig.addPassthroughCopy('src/assets/css');
    eleventyConfig.addPassthroughCopy('src/assets/js');
  }
  eleventyConfig.addPassthroughCopy('src/assets/img');
  eleventyConfig.addPassthroughCopy('src/assets/font');
  eleventyConfig.addPassthroughCopy('src/assets/audio');
  eleventyConfig.addPassthroughCopy('src/favicon.ico');

  eleventyConfig.setDataDeepMerge(true);

  return {
    dir: {
      input: 'src',
      output: '_site',
    }
  };
};