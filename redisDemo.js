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
            client.sadd(bscore+('0' + setSize).slice(-2), 0);
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

//sorteio

function sorteio(){
    client.spop('pedras',function(err, valor){
        //console.log('(sorteio) Pedra: '+ valor); //58
        return valor;
    })  
     
}

function pesquisaCartelaSorteada(pedra = sorteio()){
    for(var i = 1; i <= 50;i++){
        let cont = i;
        client.sismember(bcartela+('0'+cont).slice(-2),pedra,function(err, possuiPedra){
            if(possuiPedra){
              console.log('(pesquisaCartelaSorteada) Cartela: '+bcartela+('0'+cont).slice(-2)+' possui Pedra: '+possuiPedra);
              return bcartela+('0'+cont).slice(-2);
            }
        })

    }

}

function pesquisaCartelaJogador(cartelaSorteada = pesquisaCartelaSorteada){
    for(var i = 1; i<= 50;i++){
        let num = ('0'+i).slice(-2);
        client.hmget(key+num, 'bcartela', function(err, cartelaJogador){ //Procura nas 50 pessoas a cartela sorteada
            if(cartelaJogador == cartelaSorteada){
               console.log('(pesquisaCartelaJogador) Pontuar jogador: '+ key+num); 
               return key+num; //retorna chave do jogador com cartela sorteada
            }  
        })

    }
}

function pontuarJogador(jogador){    
    client.hmget(jogador, 'bscore', function(err, score){ //retorna score do jogador sorteado 
        client.incrby(score, 1);  
    })
}

function verificaGanhador(){
    for(var i = 1; i<= 50;i++){
        let num = ('0'+i).slice(-2);
        client.get(bscore+num, function(err,valor){
            if(valor == 15){
                return true;
            }
        })
    }

}
                    
geraJogador();
geraRanges();
geraScores();  
geraCartelas(); 


    
let pedra2 = sorteio();
console.log(sorteio());
let ganhador = false;

while(!ganhador){
    
    let pedra = sorteio();
    console.log('Passou aqui'+pedra);
    //Pesquisa Cartelas Sorteadas
    for(var i = 1; i <= 50;i++){
        let cont = ('0'+ i).slice(-2);
        console.log(pedra);
        client.sismember(bcartela+cont,pedra,function(err, possuiPedra){
            
            if(possuiPedra){
             // console.log('(pesquisaCartelaSorteada) Cartela: '+bcartela+cont+' possui Pedra: '+possuiPedra);
              //pontuarJogador(pesquisaCartelaJogador(bcartela+cont));
            }
        })
    }
    break;

    
}


/*while(!ganhador){

    let pontos = pesquisaCartelaJogador(cartela = pesquisaCartelaSorteada(pedra = sorteio()));
    if(pontos == 15){
        ganhador;
    }

}  */            
        

    
