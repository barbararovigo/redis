//create a file called redisDemo.js in your NodeJS project

//redisDemo.js

//By default redis.createClient() will use 127.0.0.1 and port 6379. 

const redis = require('redis');
const client = redis.createClient(); // this creates a new client



//Now, we want to listen for the connect event to see whether we successfully connected to the redis-server. 
//We can check for a successful connection like this

client.on('connect', function() {
    console.log('Redis client connected');
});


//Likewise, we want to check if we failed to connect to the redis-server. 
//Well we can listen for the error event for that.

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});


//Programa Pós
let key = 'user:';
let name = 'user:';
let bcartela = 'cartela:';
let bscore = 'score:'


// ----------Início de geração das informações dos jogadores---------------------

function geraJogador(){
    // Gera hash com dados dos jogadores
    try {
        let setSize = 50;
        while(setSize > 0){
            client.hset(key+('0'+ setSize).slice(-2), 'name', name + ('0'+ setSize).slice(-2));
            client.hset(key+ ('0'+ setSize).slice(-2), 'bcartela', bcartela + ('0'+ setSize).slice(-2));
            client.hset(key+ ('0'+ setSize).slice(-2), 'bscore', bscore + ('0'+ setSize).slice(-2));
        setSize -= 1;
        }
    }
    catch (error) {
        console.error(error);
    }
}


function geraRanges(){
    //Gera range de 1 a 99 das cartelas e das pedras
    try {
        let setSize = 99;
        while(setSize > 0){
            client.sadd('rangeCartelas' , setSize); //set para as cartelas
            client.sadd('pedras',setSize);//set para as "pedras" do bingo
            setSize -= 1;
        }
    } 
    catch (error) {
        console.error(error);
    }
}

function geraScores(){
    // Gera hash nome do usuário
    try {
        let setSize = 50;
        while(setSize > 0){
            client.hset(bscore+ ('0'+ setSize).slice(-2), 'bscore', 0);
        setSize -= 1;
        }
    }
    catch (error) {
        console.error(error);
    }
}

function geraCartelas(){
    //Gera cartelas
    for(var i = 1; i <= 50;i++){
        let setSize = i;
        client.del(bcartela + ('0'+ setSize).slice(-2)); //exclui cartela para não ultrapassar 15 numeros
        client.srandmember('rangeCartelas',15, function (err, members){
            client.sadd(bcartela + ('0'+ setSize).slice(-2), members);
        });
    }
}

                    
geraJogador();
geraRanges();
geraScores();  
geraCartelas(); 


var flag = 1;
for(var flag = 1; flag <= 99;flag++){
//while(ganhador == 0 ){
    client.spop('pedras',function(err, pedra){ //Sorteia uma pedra
        //Pesquisa Cartelas Sorteadas
        for(var i = 1; i <= 50;i++){ //Percorre as 50 cartelas   
            let cont = ('0'+ i).slice(-2);
            client.sismember(bcartela+cont,pedra,function(err, possuiPedra){  //verifica se a cartela possui a pedra    
                if(possuiPedra){  // Se a cartela possui a pedra
                  let cartelaSorteada = bcartela+cont;
                 for(var i2 = 1; i2<= 50;i2++){ //procura das 50 pessoas a cartela
                    let num = ('0'+i2).slice(-2);
                    client.hmget(key+num, 'bcartela', function(err, cartelaJogador){ //Procura nas 50 pessoas a cartela sorteada
                        if(cartelaJogador == cartelaSorteada){ // Se encontrou a pessoa com a cartela 
                            client.hmget(key+num, 'bscore', function(err,score){ //retorna score do jogador sorteado 
                               client.hincrby(score+'', 'bscore', 1, function(err, ret){ //incrementa a pontuação da pessoa
                                    if(err) 
                                        throw err;
                                    else { 
                                        console.log('Pontuação do jogador na rodada '+flag+ ' é ' +key+num+' até agora é: '+ret);
                                        if (ret==15){
                                          console.log('Jogador: '+key+num+' venceu a partida com 15 pontos!');   
                                           flag = 100;
                                        }
                                    };

                               });
                           })
                           
                        }  
                    })            
                  }

                }
            })
        }
    })
};




    
