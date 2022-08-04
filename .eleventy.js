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
      if (sheet.published_on) {
        if (!songs[sheet.song_id]) {
          songs[sheet.song_id] = {
            'id': sheet.song_id,
            'title': sheet.title,
            'artist': sheet.artist,
            'artists': sheet.artists,
            'filters': '',
            'published_on': '',
            'sheetList': {},
          };
        }

        // Store sheet object
        songs[sheet.song_id].sheetList[sheet.id.slice(5, 7)] = sheet;

        // Get filters of every sheet for the song concatenated
        songs[sheet.song_id].filters =
          songs[sheet.song_id].filters.concat(' ', sheet.filters).trim();

        // Get the latest publication date
        songs[sheet.song_id].published_on =
          songs[sheet.song_id].published_on < sheet.published_on ?
            sheet.published_on : songs[sheet.song_id].published_on;
      }
    });

    return Object.values(songs);
  });

  /**
   * Artist collection.
   */
  eleventyConfig.addCollection('artists', function(collectionApi) {
    var artists = {};
    collectionApi.items[0].data.sheeteria.forEach(function(sheet) {
      if (sheet.published_on) {
        sheet.artists.forEach(function(artist) {
          if (!artists[artist.slug]) {
            artists[artist.slug] = {
              'name': artist.name,
              'slug': artist.slug,
              'songList': {}
            }
          }

          // Add song
          if (!artists[artist.slug].songList[sheet.song_id]) {
            artists[artist.slug].songList[sheet.song_id] = {
              'id': sheet.song_id,
              'title': sheet.title,
              'sheetList': {}
            }
          }
        });
      }
    });

    return Object.values(artists);
  });

  /**
   * Convert given object to array and sort by 'title' property.
   */
  eleventyConfig.addFilter('sortByTitle', function(obj, isAsc) {
    return Object.values(obj).sort(function(a, b) {
      return isAsc === a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1;
    });
  });

  /**
   * Convert given object to array and sort by 'id' property.
   */
  eleventyConfig.addFilter('sortById', function(obj, isAsc) {
    return Object.values(obj).sort(function(a, b) {
      return isAsc === a.id.toLowerCase() > b.id.toLowerCase() ? 1 : -1;
    });
  });

  /**
   * Convert given object to array and sort by 'name' property.
   */
  eleventyConfig.addFilter('sortByName', function(obj, isAsc) {
    return Object.values(obj).sort(function(a, b) {
      return isAsc === a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
    });
  });

  /**
   * Convert sheet id for shortened URL.
   * It's "song ID without leading zeros" + "-" + "variation ID without leading zeros" (e.g. 0003-01 -> 3-1)
   */
  eleventyConfig.addFilter('shortslug', function(id) {
    return id.replace(/^0+/, '').replace(/-0?/, '-').toLowerCase();
  });

  /**
   * Load data from csv file.
   */
  eleventyConfig.addDataExtension("csv", (contents) => {
    var sheeteria = parse(contents, {
      columns: true,
      skip_empty_lines: true,
    });

    // Remove items not ready
    sheeteria = sheeteria.filter(function(sheet) {
      return '' !== sheet.status;

    // Sort by publishing date descending
    }).sort(function(a, b) {
      return a.published_on < b.published_on ? 1 : -1;
    });

    sheeteria.forEach(function(sheet) {
      // Meta
      sheet.displayTitle = `${sheet.title} (${sheet.artist}) - ${sheet.style}`;
      sheet.description = `${sheet.style === 'Lead Sheet' ? sheet.style : sheet.style + 'Sheet Music'} for ${sheet.artist}'s ${sheet.title}`;
      sheet.url = `/sheet/${sheet.id.toLowerCase().replace('-', '/')}/`;

      // Artists
      sheet.artists = [];
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

      // Add values used for filtering

      // Keyword
      sheet.keyword = `${sheet.title.toLowerCase()} ${sheet.artist.toLowerCase()}`;

      // Style
      var styleFilter = 's1';
      switch(sheet.style.toLowerCase()) {
        case 'lead sheet':
          styleFilter = 's0';
          break;

        case 'easy piano':
          styleFilter = 's2';
          break;
      }
      sheet.filters = styleFilter;
    });

    return sheeteria;
  });

  /**
   * Format date string for RSS feed.
   */
  eleventyConfig.addFilter('rssDate', function(date) {
    return new Date(date).toUTCString();
  });

  /**
   * Minify HTML on production build.
   */
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