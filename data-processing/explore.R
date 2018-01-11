library(readr)
library(dplyr)
library(ggplot2)

data=read_delim("./matchs200kfullmeta.csv",col_names = FALSE,delim=',')
head(data)
names(data)=c("class","deck","oppclass","oppdeck","uid","rank","gid","player","name","result","turn","cardid")

meta.card=read_delim("./skip_gram_tsne200kwinrates.csv",delim=',')
meta.card = meta.card[,-c(1,3,4,6)]

data = data %>% mutate(lres = (player=="me" & result =="win") | (player=="opponent" & result=="loss"))

uperfs = data %>% dplyr::select(uid,gid,result) %>% distinct() %>% mutate(win=result=="win") %>% 
  group_by(uid) %>% 
  summarise(perf=mean(win,na.rm=TRUE),nbg=n()) %>% 
  dplyr::filter(nbg>100) %>%
  arrange(desc(perf)) 

ggplot(data=uperfs,aes(x=perf))+geom_histogram()+xlab("Players average winrates")

dcperfs = data %>% select(class,deck,oppclass,oppdeck,gid,player,lres) %>% 
  distinct() %>%
  mutate(fdeck = ifelse(player=="me",deck,oppdeck),fclass=ifelse(player=="me",class,oppclass)) %>%
  select(gid,deck=fdeck,class=fclass,lres)

deckperfs = dcperfs %>% group_by(deck) %>% summarise(perf=mean(lres,na.rm=TRUE)) %>% arrange(desc(perf))

ggplot(deckperfs)+geom_bar(aes(x=reorder(deck,perf),y=perf),stat = "identity")+geom_hline(yintercept = 0.5,color="red")+
  coord_flip()+
  scale_x_discrete()+
  scale_y_continuous(limits=c(0,0.6),breaks=c(0,0.1,0.2,0.3,0.4,0.5,0.6))       

classperfs = dcperfs %>% group_by(class) %>% summarise(perf=mean(lres,na.rm=TRUE)) %>% arrange(desc(perf))

ggplot(classperfs)+geom_bar(aes(x=reorder(class,perf),y=perf),stat = "identity")+geom_hline(yintercept = 0.5,color="red")+
  coord_flip()+
  scale_x_discrete()+
  scale_y_continuous(limits=c(0,0.6),breaks=c(0,0.1,0.2,0.3,0.4,0.5,0.6))     


dataf = data %>% mutate(fdeck = ifelse(player=="me",deck,oppdeck),fclass=ifelse(player=="me",class,oppclass))

deckclass = dataf %>% select(gid,player,fdeck,fclass,lres) %>% distinct() %>% group_by(fdeck,fclass) %>% summarise(perf=mean(lres,na.rm=TRUE),nb=n())

ggplot(deckclass)+geom_point(aes(x=fclass,y=fdeck,color=perf,size=nb))+scale_size_area(max_size=10)

deckcards = dataf %>% select(fdeck,name,lres) %>% group_by(fdeck,name) %>% summarise(count=n(),perf=mean(lres,na.rm=TRUE))%>% arrange(fdeck,desc(count))
dpirates = deckcards %>% filter(fdeck=="Pirate",count>100) %>% left_join(meta.card) %>% filter(type!='HERO_POWER',!is.na(cost),name!='The Coin') %>% arrange(desc(perf))

ggplot(dpirates)+geom_bar(aes(x=reorder(name,count),y=count),stat = "identity")+coord_flip()

daggro = deckcards %>% filter(fdeck=="Aggro",count>200)
ggplot(daggro)+geom_bar(aes(x=reorder(name,count),y=count),stat = "identity")+scale_y_log10("#frequence")+coord_flip()

dsecret = deckcards %>% filter(fdeck=="Secret",count>200)  %>% left_join(meta.card) %>% filter(type!='HERO_POWER',!is.na(cost),name!='The Coin') %>% arrange(desc(perf))



# suppresion des cartes jouée en double dans le même match
data.card = data %>% dplyr::select(gid,player,name,lres) %>% distinct()

# calcul des winrates
data.card.res = data.card %>% group_by(name) %>% summarise(winrates = mean(lres,na.rm=TRUE),count = n())

# cartes frequentes
freq.cards = data.card.res %>% filter(count > 100) %>% arrange(desc(winrates))
head(freq.cards)

# calcul des winrates/combo
data.combo.res = data %>% semi_join(freq.cards,by=c("name")) %>% dplyr::select(gid,player,name,lres)%>% 
  left_join(data,by=c("gid","player"),suffix = c(".l",".r")) %>% 
  dplyr::select(card1 = name.l,card2 = name.r,lres = lres.l) %>%
  group_by(card1,card2) %>% summarise(winrates = mean(lres,na.rm=TRUE),count = n())

freq.combos = data.combo.res %>% filter(card1!=card2,count > 100) %>% arrange(desc(winrates)) %>% 
  mutate( key = ifelse(card1>card2,paste(card1,card2,sep="_"),paste(card2,card1,sep="_")))  %>% 
  ungroup() %>% distinct(key,.keep_all=TRUE)

nbg = max(data$gid,na.rm=TRUE)

stats = freq.combos %>% dplyr::select(-key) %>% left_join(freq.cards, by=c("card1"="name"),suffix =c("",".card1")) %>%  
  left_join(freq.cards, by=c("card2"="name"),suffix =c("",".card2")) %>%
  mutate(combowin = log(winrates/(winrates.card1*winrates.card2)),combo=log(count/nbg)-(log(count.card1/nbg)+log(count.card2/nbg))) %>%
  arrange(desc(combo))

stats.win = stats %>% filter(count > 100)
stats.win.type = stats.win %>% left_join(data.pos,by=c("card1"="name"),suffix=c("",".card1"))%>% left_join(data.pos,by=c("card2"="name"),suffix=c("",".card2"))

View(stats.win)




data.pos=read_delim("./skip_gram_tsne200kwinrates.csv",delim=',')

combos = unique(c(stats.win$card1,stats.win$card2))

data.pos.points = data.pos %>% filter(name %in% combos)


ggplot()+geom_text(data=stats.win.type,aes(y=winrates,x=combo,label=paste(card1,card2),col=cardClass,size=winrates))+facet_wrap(~cardClass)

install.packages("ggrepel")
ggplot()+geom_point(data=data.pos.points,aes(x=t0,y=t1,col=cardClass))

dp = data.pos %>% dplyr::select(name,t0,t1)

data.pos.combos = stats.win %>% left_join(dp,by=c("card1"="name"),suffix=c("",".card1")) %>% 
  left_join(dp,by=c("card2"="name"),suffix=c("",".card2")) 

ggplot()+geom_segment(data=data.pos.combos,aes(x=t0,y=t1,xend=t0.card2,yend=t1.card2,size=winrates,alpha=combo))+
  geom_point(data=data.pos.points,aes(x=t0,y=t1,col=cardClass,size=winrates))+
  geom_text_repel(data=data.pos.points,aes(x=t0,y=t1,col=cardClass,size=winrates,label=name))


deck=read_delim("deck.csv",delim=" ")

dt = stats.win.type %>% filter(card1 %in% deck$name & card2 %in% deck$name & combowin > 0.6 & combo > 2)
data.pos.points = data.pos %>% filter(name %in% deck$name)
ggplot()+geom_segment(data=dt,aes(x=t0,y=t1,xend=t0.card2,yend=t1.card2,size=winrates,alpha=combo))+
  geom_point(data=data.pos.points,aes(x=t0,y=t1,col=cardClass,size=winrates))+
  geom_text_repel(data=data.pos.points,aes(x=t0,y=t1,col=cardClass,size=winrates,label=name))

install.packages("igraph")
dtt=dt[,c("card1","card2")]
graph(edges=matrix(dtt,nrow(dtt)*2,1))
