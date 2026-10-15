const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
function shift(level=1){
 const context=vm.createContext({GAMES:[],startGame(){}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../public/cafe.js'),'utf8'),context);
 return vm.runInContext(`createCafeShift(${level},()=>0)`,context);
}
function prepare(game,ingredients=game.state.order.ingredients,pastry=game.state.order.pastry){
 ingredients.slice().reverse().forEach(id=>assert.equal(game.add(id),true));
 assert.equal(game.brew(),true);assert.equal(game.serve(),null);
 assert.equal(game.finishBrew(),true);game.choosePastry(pastry);
}
test('café shift requires brewed recipe and pastry, completes once, and scales levels',()=>{
 const game=shift();assert.equal(game.state.target,3);assert.equal(game.serve(),null);
 for(let n=0;n<3;n++){
  prepare(game);assert.equal(game.serve(),true);assert.equal(game.state.served,n+1);
 }
 assert.equal(game.state.won,true);assert.equal(game.state.done,true);
 assert.equal(game.state.score,3*150+114*3);
 const score=game.state.score;
 assert.equal(game.serve(),null);assert.equal(game.add('milk'),false);assert.equal(game.reset(),false);assert.equal(game.choosePastry('cake'),false);game.tick();
 assert.equal(game.state.score,score);assert.equal(game.state.seconds,114);
 assert.equal(shift(10).state.target,6);assert.equal(shift(30).state.target,8);
});
test('café mistakes, duplicate ingredients and reset follow the recipe boundaries',()=>{
 const game=shift();
 assert.equal(game.add('not-an-ingredient'),false);assert.equal(game.add('cake'),false);
 game.add('milk');game.reset();assert.equal(game.state.ingredients.length,0);
 prepare(game,['espresso','milk','milk']);assert.equal(game.serve(),false);assert.equal(game.state.hearts,2);assert.equal(game.state.served,0);
 prepare(game,game.state.order.ingredients,'cake');assert.equal(game.serve(),false);assert.equal(game.state.hearts,1);
 prepare(game,['water']);assert.equal(game.serve(),false);assert.equal(game.state.done,true);assert.equal(game.state.won,false);assert.equal(game.state.score,0);
});
test('café brewing blocks edits, timeout prevents late brewing and serving',()=>{
 const game=shift();game.add('espresso');game.brew();
 assert.equal(game.add('milk'),false);assert.equal(game.reset(),false);assert.equal(game.brew(),false);
 while(!game.state.done)game.tick();
 assert.equal(game.state.seconds,0);assert.equal(game.finishBrew(),false);assert.equal(game.serve(),null);assert.equal(game.state.won,false);
});
