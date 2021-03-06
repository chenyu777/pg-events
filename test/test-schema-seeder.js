var expect = require('chai').expect;
var projectionFolder = __dirname + '/projections';
var harness = require('./harness');
var seeder = require('../lib/seeder');

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

describe('The Database Seeder', function(){
	var result = null;

	before(function(){
		return harness.seed().then(function(r){
			result = r;
		});
	});


	it('Should be able to seed the basic database schema', function(){
		expect(result.tables).to.include('pge_events');
		expect(result.tables).to.include('pge_modules');
		expect(result.tables).to.include('pge_projection_definitions');
		expect(result.tables).to.include('pge_projections');
		expect(result.tables).to.include('pge_streams');
		expect(result.tables).to.include('pge_aggregates');
	});

	it('should load the reused javascript modules', function(){
		expect(result.modules).to.include('eventstore');
		expect(result.modules).to.include('projections');
		expect(result.modules).to.include('stream-aggregator');
		expect(result.modules).to.include('aggregate-projector');
		expect(result.modules).to.include('event-projector');
		expect(result.modules).to.include('snapshot-aggregator');
		expect(result.modules).to.include('postgres-store');
		expect(result.modules).to.include('store-base');
	});

	it('should create new projection tables in the schema', function(){
		expect(result.tables).to.include('pge_projections_party');
		expect(result.tables).to.include('pge_projections_arrival');
	});


	it('should create the new event queue table in the schema', function(){
		expect(result.tables).to.include('pge_rolling_buffer');
	});

	it('should be able to load all the projections from a folder path', function(){
		var projector = require('../lib/projections');
		var files = projector.loadProjectionsFromFolder(projectionFolder);

		expect(projector.activeProjectionNames()).to.deep.equal(['Arrival', 'Arrival2', 'Party', 'Party2', 'Traveled']);
	});

	it('should load the content for projections into the db', function(){
		expect(result.projections).to.include('Arrival');
		expect(result.projections).to.include('Arrival2');
		expect(result.projections).to.include('Party');
		expect(result.projections).to.include('Traveled');
	});

	it('should be able to generate all the DDL for projection tables', function(){
		var DDL = seeder.generateDDL({projection_folder: projectionFolder});

		expect(DDL).to.include('DROP TABLE IF EXISTS pge_projections_arrival CASCADE;');
		expect(DDL).to.include('CREATE TABLE pge_projections_arrival');
		expect(DDL).to.include('DROP TABLE IF EXISTS pge_projections_party CASCADE;');
		expect(DDL).to.include('CREATE TABLE pge_projections_party');

		// shouldn't be adding a new table for an aggregate
		expect(DDL).to.not.include('pge_projections_traveled');
	});
});



