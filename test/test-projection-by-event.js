var assert = require('chai').assert;
var expect = require('chai').expect;
var projector = require("../lib/projections");
var InMemoryStore = require("../lib/in-memory-store");



describe('Projecting an event', function(){
	it('should transform and event and place it in the right store', function(){
		var id = 0;

		var store = new InMemoryStore();

		var projection = projector
			.projectEvent('TownReached')
			.named('Arrival')
			.by(function(evt){
				id = id + 1;

				return {
					town: evt.location,
					$id: id
				};
			});


		projection.processEvent(store, 1, {$id: 1, location: "Caemlyn"});
		projection.processEvent(store, 2, {$id: 2, location: "Four Kings"});
		projection.processEvent(store, 3, {$id: 3, location: "Whitebridge"});

		expect(store.findView(projection.name, 1)).to.deep.equal({$id: 1, town: "Caemlyn"});
		expect(store.findView(projection.name, 2)).to.deep.equal({$id: 2, town: "Four Kings"});
		expect(store.findView(projection.name, 3)).to.deep.equal({$id: 3, town: "Whitebridge"});
	});
});