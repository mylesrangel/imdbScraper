const main = document.querySelector('main');
const imdbID = (window.location.search.match(/imdbID=(.*)/)[1]);
const BASE_URL = 'https://hbwebscraper.now.sh/';

function getMovie(imdbID){

	return fetch(`${BASE_URL}movie/${imdbID}`)
		.then(res => res.json())

}

function showMovie(movie){


	//creating the section to add the movie information
	const section = document.createElement('section');
	main.appendChild(section);

	const date = dateFns.parse(movie.datePublished);

	movie.datePublished = dateFns.format(date, 'MMMM Do YYYY')


	//mapping the values
	const properties = [
		{
			title: 'Rating',
			property:'imdbRating'
		},
		{
			title: 'Run Time',
			property: 'runtime'
		},
		{
			title: "Released",
			property: 'datePublished'
		}, 
		{
			title: 'Summary',
			property:'summary'
		},
		{
			title: 'Story Line',
			property: 'storyLine'
		}]
	

	const descriptionHTML = properties.reduce((html,property) => {

		html +=`<dt class="col-sm-3">${property.title}</dt>
			    <dd class="col-sm-9">${movie[property.property]}</dd>`;

			   return html;
	}, '');

	section.outerHTML = `

		<section class="row">
			<h1 class = "text-center"> ${movie.title} </h1>
			<div class = "col-sm-6">
				<img src="${movie.moviePoster}" class="img-fluid" />
			</div>
			<div class="col-sm-6">
			<dl class="row">
				  ${descriptionHTML}
				</dl>
			</div>
		</secion>
	`


}

/////////run this here////////////in the beginning/////////

getMovie(imdbID)
	.then(showMovie)

