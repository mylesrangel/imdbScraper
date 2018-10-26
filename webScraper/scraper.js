//node fetch makes the request
const fetch = require('node-fetch');
//cheerio parses the information
const cheerio = require('cheerio');


const searchUrl = 'https://www.imdb.com/find?ref_=nv_sr_fn&&s=all&q=';
const movieUrl = 'https://www.imdb.com/title/';

const movieCache = {};
const searchCache = {};

function searchMovies(searchTerm) {

    if (searchCache[searchTerm]) {
        console.log('Serving from Cache:', searchTerm);
        return Promise.resolve(searchCache[searchTerm]);
    }
    return fetch(`${searchUrl}${searchTerm}`)
        .then(response => response.text()) //adding .text() return the html not the JSON
        .then(body => { // go in the body tag
            const movies = [];
            const $ = cheerio.load(body);
            $('.findResult').each(function(i, element) { ///WAS: findResult: imdbID will throw error
                const $element = $(element); //finds all of the 'element' of the url
                const $image = $element.find('td a img'); //find a td then an a then an img 
                const $title = $element.find('td.result_text a');

                ///imdbID sometimes is null so if statement is required to determine if imdbID is null
                let imdbID = $title.attr('href').match(/title\/(.*)\//);

                if (imdbID) {
                    imdbID = imdbID[1];
                }

                console.log(imdbID);
                const movie = {
                    image: $image.attr('src'),
                    title: $title.text(),
                    imdbID
                };

                movies.push(movie);

            });

            //toss it in the cache
            searchCache[searchTerm] = movies;
            return movies;
        });

}

function getMovie(imdbID) {


    if (movieCache[imdbID]) {
        console.log('Serving from Cache: ', imdbID);
        return Promise.resolve(movieCache[imdbID]);
    }


    return fetch(`${movieUrl}${imdbID}`)
        .then(response => response.text())
        .then(body => {
            const $ = cheerio.load(body);
            const $title = $('.title_wrapper h1');
            const $rating = $('.subtext');
            const $runtime = $('time');
            const $genre = $('div.subtext a[href*="search"]'); //the '*' in href means contains the word. There are others e.g. "href ^= something" means href starts with the word something
            const datePublished = $('div.subtext a[href*="releaseinfo"]').text().replace(/[\t\n ,]+/g, "");
            const imdbRating = $('span[itemprop = ratingValue]').text().replace(/[\t\n ,]+/g, "");
            const moviePlot = $('div.summary_text').text().trim().replace(/[\t\n,]+/g, "");

            const $director = $('div.credit_summary_item a[href*="dr"]');
            const $writer = $('div.credit_summary_item a[href*="wr"]');

            //TODO: fix 'see full cast entry' 
            const $star = $('div.credit_summary_item a[href*="sm"]');
            const storyLine = $('div.inline.canwrap p span').text().trim().replace(/[|\n]+/g, " ");


            //TODO: img is low resolution do I want it bigger (need it)?
            const moviePoster = $('div.poster img').attr("src");

            const $productionCompany = $('div.txt-block a[href^="/company"]');

            const trailer = $('div.slate a').attr('href')


            const title = $title.first().contents().filter(function() {
                return this.type === 'text';
            }).text().trim(); //get the text and trim the white space

            const rating = $rating.first().contents().filter(function() {
                return this.type === 'text';
            }).text().trim().replace(/[\t\n ,]+/g, ""); //removes \t, \n and , in result and replaces them with "" (nothing)

            const runtime = $runtime.first().contents().filter(function() {
                return this.type === 'text';
            }).text().replace(/[\t\n ,]+/g, "");


            function getItems(itemArray) {
                return function(i, element) {
                    const item = $(element).text().trim();
                    itemArray.push(item);
                };
            }



            //Getting Genres[]
            const genres = [];
            $genre.each(getItems(genres));

            //Getting Directors array (in case there is more than one)
            const directors = [];
            $director.each(getItems(directors));

            //Getting writers array
            const writers = [];
            $writer.each(getItems(writers));

            const stars = [];
            $star.each(getItems(stars));

            const productionCompanies = [];
            $productionCompany.each(getItems(productionCompanies));


            const movie = {
                imdbID,
                title,
                rating,
                runtime,
                genres,
                datePublished,
                rating,
                imdbRating,
                moviePoster,
                moviePlot,
                directors,
                writers,
                stars,
                storyLine,
                productionCompanies,
                trailer: `https://www.imdb.com${trailer}` //prepending the trailer to get the video


            };

            movieCache[imdbID] = movie;

            return movie;
        })


}

module.exports = {

    searchMovies,
    getMovie
}