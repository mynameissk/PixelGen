import test from 'node:test';
import assert from 'node:assert/strict';
import { distance, movePlayer, WORLD } from '../apps/web/src/game-logic.mjs';

test('distance is Euclidean', () => {
  assert.equal(distance({x:0,y:0},{x:3,y:4}),5);
});

test('player moves at consistent diagonal speed', () => {
  const start={x:300,y:300,speed:100,radius:8};
  const horizontal=movePlayer(start,{right:true},.05);
  const diagonal=movePlayer(start,{right:true,down:true},.05);
  assert.ok(Math.abs(Math.hypot(horizontal.x-start.x,horizontal.y-start.y)-5)<.001);
  assert.ok(Math.abs(Math.hypot(diagonal.x-start.x,diagonal.y-start.y)-5)<.001);
});

test('movement stays inside world bounds', () => {
  const result=movePlayer({x:WORLD.width-20,y:WORLD.height-20,speed:500,radius:10},{right:true,down:true},.05);
  assert.ok(result.x<=WORLD.width-WORLD.margin-10);
  assert.ok(result.y<=WORLD.height-WORLD.margin-10);
});

test('rectangular collision blocks movement', () => {
  const result=movePlayer({x:88,y:100,speed:100,radius:9},{right:true},.05,[{x:96,y:80,width:30,height:40}]);
  assert.equal(result.x,88);
  assert.equal(result.y,100);
});

test('movement time step is capped to prevent large jumps', () => {
  const start={x:200,y:200,speed:100,radius:8};
  const result=movePlayer(start,{right:true},2);
  assert.equal(result.x-start.x,5);
});
