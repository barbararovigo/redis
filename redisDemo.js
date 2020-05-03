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
let key = 'user';
let name = 'user';
let bcartela = 'cartela:';
let bscore = 'score:'


// ----------Início de geração das informações dos jogadores---------------------

// Gera hash nome do usuário
try {
    let setSize = 50;
    while(setSize > 0){
        client.hset(key+setSize, 'name', name+setSize);
    setSize -= 1;
    }
}
catch (error) {
    console.error(error);
}

// Gera hash cartela do usuário
try {
    let setSize = 50;
    while(setSize > 0){
        client.hset(key+setSize, 'bcartela', bcartela+setSize);
    setSize -= 1;
    }
}
catch (error) {
    console.error(error);
}

// Gera hash score do usuário
try {
    let setSize = 50;
    while(setSize > 0){
        client.hset(key+setSize, 'bscore', bscore+0);
    setSize -= 1;
    }
}
catch (error) {
    console.error(error);
}

//Gera range de 1 a 99 das cartelas

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

//Gera cartelas

for(var i = 1; i <= 50;i++){
    let setSize = i;
    client.del(bcartela+setSize); //exclui cartela para não ultrapassar 15 numeros
    client.srandmember('rangeCartelas',15, function (err, members){
        client.sadd(bcartela+setSize, members);
    });
}

//sorteio
let ganhador = 0;

    client.spop('pedras',function(err, pedra){
        console.log('Pedra: '+pedra); //58
        for(var i = 1; i <= 50;i++){
            let cont = i;
            client.sismember(bcartela+cont,pedra,function(err, possuiPedra){
                if(possuiPedra){
                    console.log('Cartela: '+bcartela+cont+' possui Pedra: '+possuiPedra);
                    for(var i2 = 1; i2<= 50;i2++){
                        let cont2 = i2;
                        client.hmget(key+cont2, 'bcartela', 'bscore', function(err, jogo){ //Procura nas 50 pessoas a cartela premiada
                            if(jogo[0] == bcartela+cont){
                                console.log('Passou aqui');
                                let pontos = Number(jogo[1].replace('score:', '') ) + 1;
                                client.hset(key+cont2, 'bscore', bscore+pontos);
                                console.log(pontos);
                                if(pontos == 15){
                                    console.log('Parabéns! O jogador '+key+cont2+' é o vencedor.');    
                                    ganhador = 1; 
                                }                    
                                                       
                            }
                        })                                
                        
                    }
                        

                }
            })
        }

    })
