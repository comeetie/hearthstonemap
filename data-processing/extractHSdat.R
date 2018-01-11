library(jsonlite)
library(RCurl)
base = "http://files.hearthscry.com/collectobot/"
# paste("2016-",sprintf('%02i',6:12),".zip",sep=''),
urls = c(paste("2017-",sprintf('%02i',1:9),".zip",sep=''))
bdown=function(url, file){
  f = CFILE(file, mode="wb")
  a = curlPerform(url = url, writedata = f@ref, noprogress=FALSE)
  close(f)
  return(a)
}
nbg = 0
urls = c(paste("./RawData/2016-",sprintf('%02i',6:12),".json",sep=''),paste("./RawData/2017-",sprintf('%02i',1:9),".json",sep=''))
for(u in urls){
  print(u)
  try({
  #bdown(paste(base,u,sep=''),u)
  #data=fromJSON(unzip(u))
  data=fromJSON(u)
  drank = data$games[data$games$mode=="ranked",]
  for (i in 1:nrow(drank)){
    game = drank[i,"card_history"][[1]]
    if(nrow(game)>5){
      print(".")
      MC=game[game$player=="me","card"]["name"]
      cat(drank$hero[i],drank$hero_deck[i],nbg,drank[i,'result'],as.matrix(MC),"\n",file="matchseqdata200kwithclass.csv",sep=",",append=TRUE)
      if(drank[i,'result']=='win'){
        opr = "loss"
      }else{
        opr = "win"
      }
      OC=game[game$player=="opponent","card"]["name"]
      cat(drank$opponent[i],drank$opponent_deck[i],nbg,opr,as.matrix(OC),"\n",file="matchseqdata200kwithclass.csv",sep=",",append=TRUE)
      nbg=nbg+1
      }
  }
  })
}


urls = c(paste("./RawData/2016-",sprintf('%02i',6:12),".json",sep=''),paste("./RawData/2017-",sprintf('%02i',1:9),".json",sep=''))
nbg=0
for(u in urls){
  data=fromJSON(u)
  drank = data$games[data$games$mode=="ranked",]
  for (i in 1:nrow(drank)){
    game = drank[i,"card_history"][[1]]
    if(nrow(game)>5){
      gg=data.frame(hero = drank$hero[i], deck =drank$hero_deck[i], opp=drank$opponent[i],opp_deck=drank$opponent_deck[i], uid = drank$user_hash[i],rank = drank$rank[i],gid=nbg,player=game$player,card=game$card$name,result=drank$result[i],turn=game$turn,cardid=game$card$id)
      write.table(gg,"matchs200kfullmeta.csv",append=TRUE,col.names=FALSE,row.names = FALSE,sep=',')
      nbg=nbg+1
    }
  }
}
