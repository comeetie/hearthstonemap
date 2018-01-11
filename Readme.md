This repo contains the source for processing and visualisazing hearthstone matchs data. The final map is based on 200 000 ranked hearthstone games. This coressponds to more than 4 000 000 cards played and recorded by <a href="http://www.hearthscry.com/CollectOBot">collecto-bot</a> over one year and an half.

A live version of the map is available <a href="http://www.comeetie.fr/galerie/hearthstone/">here</a>.

Using this dataset we constructed 400 000 series of played cards one for each player in a game. These series were fed to a word2vec embedding [<a href="https://arxiv.org/abs/1301.3781">Mikolov, Tomas et al</a>] algorithm (with negative sampling [<a href="https://arxiv.org/abs/1402.3722">Goldberg, Yoav; Levy, Omer</a>] and a single soft-plus final layer) to learn 64 dimensional vectors for embeding all the 1600 cards. The final 2d projection was derived from these vectors using a t-sne [<a href="http://jmlr.csail.mit.edu/papers/volume9/vandermaaten08a/vandermaaten08a.pdf">Van der Maaten, Laurens ; Hinton, Geoffrey </a>] with default settings. The code is available on <a href="">github</a>. The same dataset was used to estimate winrates and frequency of each card.  

The interface is build using, <a href="https://d3js.org/">d3</a>, a lot of love, a bit of <a href="http://backbonejs.org/">backbone</a> and some <a href="https://github.com/HearthSim/hsdata">data</a> and <a href="https://github.com/schmich/hearthstone-card-images">images</a> collected by the huge community around hearthstone. 

