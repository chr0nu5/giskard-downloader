var Base = requireBaseModule(),
    tpb = require('thepiratebay');

var Downloader = function(bot) {
    Base.call(this, bot);

    this.respond(/quero baixar o filme (.*)$/i, (response) => {
        response.sendTyping();
        this.http({
                uri: "https://yts.ag/api/v2/list_movies.json?limit=5&query_term=" + response.match[1]
            })
            .then((result) => {
                result = JSON.parse(result);
                var total = result.data.movie_count;
                if (total > 0) {
                    var movies = result.data.movies;
                    movies.forEach((movie) => {
                        var str = "";
                        str += movie.title_english + " (" + movie.year + ")\n";
                        str += "```\n";
                        movie.torrents.forEach((torrent) => {
                            str += torrent.quality + " (" + torrent.size + ", " + torrent.seeds + " seeder(s)): " + torrent.url + "\n";
                        })
                        str += "```";
                        response.send(str);
                    });
                } else {
                    response.send("Não consegui achar este filme, desculpe :(");
                }
            })
            .catch((err) => {
                this.logger.error(err);
                response.send("Não consigo buscar este filme agora, desculpe :(");
            })
    });
    this.respond(/quero baixar o arquivo (.*)$/i, (response) => {
        response.sendTyping();
        tpb.search(response.match[1], {
                orderBy: 'seeds desc'
            })
            .then(function(results) {
                if (results.length > 0) {
                    var max = 3;
                    results.slice(0, 3).map((torrent) => {
                        if (max > 0) {
                            var str = "";
                            str += torrent.name + " (" + torrent.size + ", " + torrent.seeders + " seeder(s))\n";
                            str += "```\n";
                            str += "Link: " + torrent.link + "\n";
                            str += "MagnetLink: " + torrent.magnetLink
                            str += "```";
                            response.send(str);
                            max--;
                        }
                    })
                } else {
                    response.send("Não consegui achar este arquivo, desculpe :(");
                }
            }).catch(function(err) {
                this.logger.error(err);
                response.send("Não consigo buscar este filme agora, desculpe :(");
            });
    });
};

module.exports = Base.setup(Downloader);
