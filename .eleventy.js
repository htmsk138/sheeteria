const isProduction = 'production' === process.env.ELEVENTY_ENV;
const htmlmin = require("html-minifier");
const parse = require("csv-parse/lib/sync");

module.exports = function (eleventyConfig) {
  /**
   * Song collection.
   */
  eleventyConfig.addCollection('songs', function(collectionApi) {
    var songs = {};
    collectionApi.items[0].data.sheeteria.forEach(function(sheet) {
      var songId = sheet.id.slice(0, 4);
      if (!songs[songId]) {
        songs[songId] = {};
        songs[songId].id = songId;
        songs[songId].title = sheet.title;
        songs[songId].artists = sheet.artists;
        songs[songId].sheetList = {};
      }
      songs[songId].sheetList[sheet.id.slice(5, 7)] = sheet.style;
    });

    // Sort sheet list by id
    Object.values(songs).forEach(function(song) {
      song.sheetList = Object.keys(song.sheetList).sort().reduce(function(result, key) {
        result[key] = song.sheetList[key];
        return result;
      }, {});
    });

    return Object.values(songs);
  });

  /**
   * Artist collection.
   */
  eleventyConfig.addCollection('artists', function(collectionApi) {
    var artists = {};
    collectionApi.items[0].data.sheeteria.forEach(function(sheet) {
      var i = 1;
      while (sheet.hasOwnProperty('artist_name_' + i.toString()) && '' !== sheet['artist_name_' + i.toString()]) {
        var artistSlug = sheet['artist_slug_' + i.toString()];

        if (!artists[artistSlug]) {
          artists[artistSlug] = {
            'name': sheet['artist_name_' + i.toString()],
            'slug': artistSlug,
            'songList': {}
          };
        }

        // Add song
        if (!artists[artistSlug].songList.hasOwnProperty(sheet.song_id)) {
          artists[artistSlug].songList[sheet.song_id] = {
            'id': sheet.song_id,
            'title': sheet.title,
            'sheetList': {}
          }
        }

        i++;
      }
    });

    return Object.values(artists);
  });

  /**
   * Convert sheet id for shortened URL.
   * It's "song ID without leading zeros" + "-" + "variation ID without leading zeros" (e.g. 0003-01 -> 3-1)
   */
  eleventyConfig.addFilter('shortslug', function(id) {
    return id.replace(/^0+/, '').replace(/-0?/, '-').toLowerCase();
  });

  /**
   * Generate filter slug based on text passed on.
   */
  eleventyConfig.addFilter('sheetFilter', function(text) {
    switch(text.toLowerCase()) {
      case 'lead sheet':
        return 's0';

      case 'easy piano':
        return 's2';
    }

    return 's1';
  });

  /**
   * Load data from csv file.
   */
  eleventyConfig.addDataExtension("csv", (contents) => {
    var sheeteria = parse(contents, {
      columns: true,
      skip_empty_lines: true,
    });

    sheeteria.forEach(function(sheet) {
      sheet.artists = [];

      // Add object for displaying artist credits.
      var i = 1;
      while (sheet.hasOwnProperty('artist_name_' + i.toString()) && '' !== sheet['artist_name_' + i.toString()]) {
        var artistObj = {
          'name': sheet['artist_name_' + i.toString()],
          'separator': sheet['artist_separator_' + i.toString()],
          'slug': sheet['artist_slug_' + i.toString()]
        };
        sheet.artists.push(artistObj);
        i++;
      }
    });

    return sheeteria;
  });

  /**
   * Format date string for RSS feed.
   */
  eleventyConfig.addFilter('rssDate', function(date) {
    return new Date(date).toUTCString();
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
  eleventyConfig.addPassthroughCopy('src/icon.png');

  eleventyConfig.setDataDeepMerge(true);

  return {
    dir: {
      input: 'src',
      output: '_site',
    }
  };
};