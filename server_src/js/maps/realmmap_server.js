const Delaunay = require('../d3-delaunay_cjs_roll/d3-delaunay.js');
const Alea = require('alea');
const MapProfiles = require('../../../client_src/js/maps/mapprofiles.js');

class RealmMap {
    #_profile_name = "RealmMap";
    #_profile;

    #_deli;
    #_path = {deli: undefined, voronoi: undefined};
    #_voronoi;
    #_margin_bleed = -15;
    #_regions;

    #_last_guess;

    #_seed;
    #_radius;
    #_relax_count;
    #_width;
    #_height;

    #_number_of_spawns;
    #_spawns = [];

    constructor(options) {
        this.#_profile = MapProfiles[this.#_profile_name];
        this.#_width = this.#_profile.map_options.width;
        this.#_height = this.#_profile.map_options.height;
        this.#_number_of_spawns = this.#_profile.map_options.number_of_spawns;
        this.#_radius = this.#_profile.map_options.radius;
        this.#_seed = options.seed;
        this.#_relax_count = this.#_profile.map_options.relax_count;
        this.load();
    }

    load() {
        this.randomize();
		this.relaxe();
		this.#_regions = new Array(this.number_of_cells);
		this.assignRegions();
        this.randomizeSpawnPoints();
    }

    regionAtPointWithMemory(x,y) {
		if(this.#_last_guess == undefined) {
			this.#_last_guess = this.#_deli.find(x,y);
			return this.#_regions[this.#_last_guess];
		} else {
			this.#_last_guess = this.#_deli.find(x,y,this.#_last_guess);
			return this.#_regions[this.#_last_guess];
		}
	}

	regionAtPoint(x,y) {
		return this.regionAtPointWithMemory(x,y);
	}

	get points() {
		return this.#_deli.points;
	}

	get halfedges() {
		return this.#_deli.halfedges;
	}

	get triangles() {
		return this.#_deli.triangles;
	}

	get number_of_cells() {
		return this.#_deli.points.length/2;
	}

    get spawns() {
        return this.#_spawns;
    }

    getCellPosition(index) {
        return {x: this.points[index*2], y: this.points[index*2+1]};
    }

	assignRegions() {
		//Assigning deep ocean to all cells that have a point on the wall.
		const width = this.#_width;
		const height = this.#_height;
		for(let cur_cell = 0; cur_cell < this.number_of_cells; cur_cell++) {
			const cell_vertices = this.#_voronoi.cellPolygon(cur_cell);
			for (var i = 0; i < cell_vertices.length; i++) {
				if(cell_vertices[i][0] == width || cell_vertices[i][0] == 0 || cell_vertices[i][1] == height || cell_vertices[i][1] == 0) {
					this.#_regions[cur_cell] = this.#_profile.RegionDescriptors.deepocean;
					break;
				}
			}
		}
		//The most middle zone should always be the mountain_top
		this.#_regions[this.#_deli.find(width/2, height/2)] = this.#_profile.RegionDescriptors.mountain_top;
		//Ensure that the beach isn't going out of the map
		this.assignBasedOnNeighbors(this.#_profile.RegionDescriptors.deepocean, this.#_profile.RegionDescriptors.ocean);
		//Everybody touching the ocean now gets to be a beach
		this.assignBasedOnNeighbors(this.#_profile.RegionDescriptors.ocean, this.#_profile.RegionDescriptors.beach);
		//everbody touching the beach gets to be forest
		this.assignBasedOnNeighbors(this.#_profile.RegionDescriptors.beach, this.#_profile.RegionDescriptors.forest);
		this.assignBasedOnNeighbors(this.#_profile.RegionDescriptors.forest, this.#_profile.RegionDescriptors.forest);
		//this.assignBasedOnNeighbors(this.#_profile.RegionDescriptors.forest, this.#_profile.RegionDescriptors.forest);
		//everbody touching the forest gets to be grasslands
		this.assignBasedOnNeighbors(this.#_profile.RegionDescriptors.forest, this.#_profile.RegionDescriptors.grasslands);
		this.assignBasedOnNeighbors(this.#_profile.RegionDescriptors.grasslands, this.#_profile.RegionDescriptors.grasslands);
		//this.assignBasedOnNeighbors(this.#_profile.RegionDescriptors.grasslands, this.#_profile.RegionDescriptors.grasslands);
		//everbody touching the grasslands gets to be highlands
		this.assignBasedOnNeighbors(this.#_profile.RegionDescriptors.grasslands, this.#_profile.RegionDescriptors.highlands);
		this.assignBasedOnNeighbors(this.#_profile.RegionDescriptors.highlands, this.#_profile.RegionDescriptors.highlands);
		//everbody touching the highlands gets to be lowmountains
		this.assignBasedOnNeighbors(this.#_profile.RegionDescriptors.highlands, this.#_profile.RegionDescriptors.lowmountains);
		//everybody left is high mountain
		for(let cur_cell = 0; cur_cell < this.number_of_cells; cur_cell++) {
			if(this.#_regions[cur_cell] == undefined) {
				this.#_regions[cur_cell] = this.#_profile.RegionDescriptors.mountain_top;
			}
		}
	}

    randomizeSpawnPoints() {
        const potential_spawns = [];
        for(let cur_cell = 0; cur_cell < this.number_of_cells; cur_cell++) {
            if(this.#_regions[cur_cell] == this.#_profile.RegionDescriptors.beach) {
                potential_spawns.push(cur_cell);
            }
        }

        const spawn_rng = new Alea(this.#_seed);
        this.#_spawns = [];
        let rand_choice;
        for (let i = 0; i < this.#_number_of_spawns; i++) {
            rand_choice = potential_spawns[Math.floor(spawn_rng()*(potential_spawns.length))];
            this.#_spawns.push(this.getCellPosition(rand_choice));
            potential_spawns.splice(rand_choice,1);
        }
    }

	assignBasedOnNeighbors(neighbor_region, new_region) {
		var copy_of_regions = new Array(this.number_of_cells);
		for(let i = 0; i < this.number_of_cells; i++) {
			if(this.#_regions[i] != undefined){
				copy_of_regions[i] = this.#_regions[i];
			}
		}
		for(let cur_cell = 0; cur_cell < this.number_of_cells; cur_cell++) {
			const neighbors = this.#_voronoi.neighbors(cur_cell);
			for (var neighbor of neighbors) {
				if(this.#_regions[cur_cell] == undefined && copy_of_regions[neighbor] == neighbor_region) {
					this.#_regions[cur_cell] = new_region;
					break;
				}
			}
		}
	}

	relaxe() {
		for(let n =0; n < this.#_relax_count; n++) {
			for (var i = 0; i < this.number_of_cells; i++) {
				const cell = this.#_voronoi.cellPolygon(i);
				var x_sum = 0;
				var y_sum = 0;
				for (var j = 0; j < cell.length; j++) {
					x_sum += cell[j][0];
					y_sum += cell[j][1];
				}
				this.#_deli.points[i*2] = Math.round(x_sum/cell.length);
				this.#_deli.points[i*2+1] = Math.round(y_sum/cell.length);
			}
			this.#_deli.update();
			this.#_voronoi.update();
		}
	}

	randomize() {
		var randomizer = poissonDiscSampler(this.#_width+this.#_margin_bleed, this.#_height+this.#_margin_bleed, this.#_radius, this.#_seed)
		var width = this.#_width;
		var height = this.#_height;
		const a = [];
		var rando = undefined;
		outerloop: while(1){
			do{
				rando = randomizer.next().value;
				if(rando == undefined) {break outerloop;}
				rando = rando["add"];
			}while(rando == undefined)
			if(rando[0] > this.#_width + this.#_margin_bleed/2 ||
			   rando[0] < -this.#_margin_bleed/2 ||
		   	   rando[1] > this.#_height + this.#_margin_bleed/2 ||
		       rando[1] < -this.#_margin_bleed/2) {
				   continue;
			   }
			a.push([Math.round(rando[0])-this.#_margin_bleed/2, Math.round(rando[1])-this.#_margin_bleed/2]);
		}
		this.#_deli = Delaunay.from(a);
		this.#_voronoi = this.#_deli.voronoi([0,0,this.#_width, this.#_height]);
	}
}

function* poissonDiscSampler(width, height, radius, seed) {
	const k = 4; // maximum number of samples before rejection
	const radius2 = radius * radius;
	const cellSize = radius * Math.SQRT1_2;
	const gridWidth = Math.ceil(width / cellSize);
	const gridHeight = Math.ceil(height / cellSize);
	const grid = new Array(gridWidth * gridHeight);
	const queue = [];
	const pRNG = new Alea(seed);

	// Pick the first sample.
	yield {add: sample(width / 2 , height / 2, null)};

	// Pick a random existing sample from the queue.
	pick: while (queue.length) {
		const i = pRNG() * queue.length | 0;
		const parent = queue[i];
		const seed = pRNG();
		const epsilon = 0.0000001;

		// Make a new candidate.
		for (let j = 0; j < k; ++j) {
			const a = 2 * Math.PI * (seed + 1.0*j/k);
			const r = radius + epsilon;
			const x = parent[0] + r * Math.cos(a);
			const y = parent[1] + r * Math.sin(a);

			// Accept candidates that are inside the allowed extent
			// and farther than 2 * radius to all existing samples.
			if (0 <= x && x < width && 0 <= y && y < height && far(x, y)) {
				yield {add: sample(x, y), parent};
				continue pick;
			}
		}

		// If none of k candidates were accepted, remove it from the queue.
		const r = queue.pop();
		if (i < queue.length) queue[i] = r;
		yield {remove: parent};
	}

	function far(x, y) {
		const i = x / cellSize | 0;
		const j = y / cellSize | 0;
		const i0 = Math.max(i - 2, 0);
		const j0 = Math.max(j - 2, 0);
		const i1 = Math.min(i + 3, gridWidth);
		const j1 = Math.min(j + 3, gridHeight);
		for (let j = j0; j < j1; ++j) {
		  const o = j * gridWidth;
		  for (let i = i0; i < i1; ++i) {
		    const s = grid[o + i];
		    if (s) {
		      const dx = s[0] - x;
		      const dy = s[1] - y;
		      if (dx * dx + dy * dy < radius2) return false;
		    }
		  }
		}
		return true;
	}

	function sample(x, y, parent) {
		const s = grid[gridWidth * (y / cellSize | 0) + (x / cellSize | 0)] = [x, y];
		queue.push(s);
		return s;
	}
}

module.exports = RealmMap;
