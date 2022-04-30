const Game = require('./game.js');
const d3 = require('d3-delaunay');
const Delaunay = d3.Delaunay;
const Alea = require('alea');

class MapManager {

	#_deli;
	#_path = {deli: undefined, voronoi: undefined};
	#_voronoi;
	#_margin_bleed = -15;
	#_regions;
	#_region_descriptors = {deepocean: 0, ocean: 1, beach: 2, forest: 3, grasslands: 4,
		                    highlands: 5, lowmountains: 6, mountain_top: 7};
	#_region_filenames = [];
	#_region_colors = [];
	#_tile_size = 128;
	#_last_guess;

	#_seed;
	#_radius;
	#_relax_count;
	#_map_image;

	constructor(radius=30) {
		this.genNewMap = this.genNewMap.bind(this);
		this.assignMapImage = this.assignMapImage.bind(this);
		this.setDefaultRegionColors();
		this.setDefaultRegionFiles();
		this.loadRegionTiles();
	}

	get map_image() {
		return this.#_map_image;
	}

	genNewMap(radius, relax_count, seed) {
		Game.registerStartupTask();
		this.randomize(radius);
		this.relaxe(relax_count);
		this.#_regions = new Array(this.number_of_cells);
		this.assignRegions();
		this.animateDrawUnderCell = this.animateDrawUnderCell.bind(this);
		this.render();
		createImageBitmap(Game.canvas).then(this.assignMapImage)
	}

	assignMapImage(img) {
		this.#_map_image = img;
		Game.startupTaskFinished();
	}

	setDefaultRegionColors() {
		this.#_region_colors[this.#_region_descriptors.deepocean] = "#6134eb";
		this.#_region_colors[this.#_region_descriptors.ocean] = "#33ccffaa";
		this.#_region_colors[this.#_region_descriptors.beach] = "#ffff66aa";
		this.#_region_colors[this.#_region_descriptors.forest] = "#007027aa";
		this.#_region_colors[this.#_region_descriptors.grasslands] = "#7fba25aa";
		this.#_region_colors[this.#_region_descriptors.highlands] = "#cfcf1baa";
		this.#_region_colors[this.#_region_descriptors.lowmountains] = "#808080aa";
		this.#_region_colors[this.#_region_descriptors.mountain_top] = "#281440aa";
	}

	setDefaultRegionFiles() {
		this.#_region_filenames[this.#_region_descriptors.deepocean] = "/Spritesheets/DeepOceanWater.png";
		this.#_region_filenames[this.#_region_descriptors.ocean] = "/Spritesheets/OceanWater.png";
		this.#_region_filenames[this.#_region_descriptors.beach] = "/Spritesheets/BeachSand.png";
		this.#_region_filenames[this.#_region_descriptors.forest] = undefined;
		this.#_region_filenames[this.#_region_descriptors.grasslands] = undefined;
		this.#_region_filenames[this.#_region_descriptors.highlands] = undefined;
		this.#_region_filenames[this.#_region_descriptors.lowmountains] = undefined;
		this.#_region_filenames[this.#_region_descriptors.mountain_top] = undefined;
	}

	loadRegionTiles(p) {
		for(var i = 0; i < this.#_region_filenames.length; i++) {
			if(this.#_region_filenames[i] != undefined) {
				Game.ssm.load(this.#_region_filenames[i], "Tile" + i, Game.tile_size, Game.tile_size, 1, 1);
			}
		}
	}

	draw() {
		//Since we draw one Game.tile_size size tile for every pixel
		//of the map we need to convert the players position to the map
		//position
		const map_pos = Game.worldToMapSpace(Game.camera_position_world);
		const start_map_pos = {x: Math.floor(map_pos.x) - Math.floor(Game.num_tiles_horizontal/2), y: Math.floor(map_pos.y) - Math.floor(Game.num_tiles_vertical/2)};
		Game.ssm.centering = false;
		for (var j = 0; j < Game.num_tiles_vertical; j++) {
			for (var i = 0; i < Game.num_tiles_horizontal; i++) {
				const cur_region = this.regionAtPointWithMemory(start_map_pos.x + i, start_map_pos.y + j);
				if(this.#_region_filenames[cur_region] != undefined) {
					const np = Game.worldToScreenSpace(Game.mapToWorldSpace({x: start_map_pos.x + i, y: start_map_pos.y + j}));
					Game.ssm.drawSprite("Tile" + cur_region, 0, np.x, np.y);
				}
			}
		}
		Game.ssm.centering = true;
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

	regionAtPointWithGuess(x,y,g) {
		return this.#_regions[this.#_deli.find(x,y,g)];
	}

	regionAtPoint(x,y) {
		return this.#_regions[this.#_deli.find(x,y)];
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

	render() {
		Game.clearWindow("white");
		this.drawRegions();
		if(Game.debug) {
			this.drawTriangles();
			this.drawCells();
			this.drawPoints();
		}
	}

	assignRegions() {
		//Assigning deep ocean to all cells that have a point on the wall.
		const width = Game.width;
		const height = Game.height;
		for(let cur_cell = 0; cur_cell < this.number_of_cells; cur_cell++) {
			const cell_vertices = this.#_voronoi.cellPolygon(cur_cell);
			for (var i = 0; i < cell_vertices.length; i++) {
				if(cell_vertices[i][0] == width || cell_vertices[i][0] == 0 || cell_vertices[i][1] == height || cell_vertices[i][1] == 0) {
					this.#_regions[cur_cell] = this.#_region_descriptors.deepocean;
					break;
				}
			}
		}
		//The most middle zone should always be the mountain_top
		this.#_regions[this.#_deli.find(width/2, height/2)] = this.#_region_descriptors.mountain_top;
		//Ensure that the beach isn't going out of the map
		this.assignBasedOnNeighbors(this.#_region_descriptors.deepocean, this.#_region_descriptors.ocean);
		//Everybody touching the ocean now gets to be a beach
		this.assignBasedOnNeighbors(this.#_region_descriptors.ocean, this.#_region_descriptors.beach);
		//everbody touching the beach gets to be forest
		this.assignBasedOnNeighbors(this.#_region_descriptors.beach, this.#_region_descriptors.forest);
		this.assignBasedOnNeighbors(this.#_region_descriptors.forest, this.#_region_descriptors.forest);
		//this.assignBasedOnNeighbors(this.#_region_descriptors.forest, this.#_region_descriptors.forest);
		//everbody touching the forest gets to be grasslands
		this.assignBasedOnNeighbors(this.#_region_descriptors.forest, this.#_region_descriptors.grasslands);
		this.assignBasedOnNeighbors(this.#_region_descriptors.grasslands, this.#_region_descriptors.grasslands);
		//this.assignBasedOnNeighbors(this.#_region_descriptors.grasslands, this.#_region_descriptors.grasslands);
		//everbody touching the grasslands gets to be highlands
		this.assignBasedOnNeighbors(this.#_region_descriptors.grasslands, this.#_region_descriptors.highlands);
		this.assignBasedOnNeighbors(this.#_region_descriptors.highlands, this.#_region_descriptors.highlands);
		//everbody touching the highlands gets to be lowmountains
		this.assignBasedOnNeighbors(this.#_region_descriptors.highlands, this.#_region_descriptors.lowmountains);
		//everybody left is high mountain
		for(let cur_cell = 0; cur_cell < this.number_of_cells; cur_cell++) {
			if(this.#_regions[cur_cell] == undefined) {
				this.#_regions[cur_cell] = this.#_region_descriptors.mountain_top;
			}
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

	relaxe(times_to_relax=1) {
		for(let n =0; n < times_to_relax; n++) {
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
		this.#_path.deli = new Path2D(this.#_deli.render());
		this.#_path.voronoi = new Path2D(this.#_voronoi.render());
	}

	drawRegions() {
		for(var i = 0; i < this.number_of_cells; i++) {
			if(this.#_regions[i] != undefined) {
				this.drawCellWithFill(i, this.#_region_colors[this.#_regions[i]]);
			}
		}
	}

	animateDrawUnderCell(event) {
	     const pos = Game.mouseToCanvas({x: event.clientX, y: event.clientY});
	     console.log(pos);
	     this.drawRegions();
	     this.drawUnderCell(pos.x, pos.y);
	}

	drawUnderCell(x, y) {
		if(x > Game.width || x < 0 || y > Game.height || y < 0) {
			Game.clearWindow("white");
			this.drawTriangles();
			this.drawCells();
			this.drawPoints();
			return;
		}
		//Game.clearWindow("white");
		var point = this.#_deli.find(x, y);
		var ctx = Game.context;
		ctx.save();
		ctx.fillStyle = "#0000ff";
		ctx.beginPath();
		ctx.arc(this.points[point*2], this.points[point*2+1], 4, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#00ff00";
		var neighbors = this.#_deli.neighbors(point);
		for ( var neighbor of neighbors ) {
			ctx.beginPath();
			ctx.arc(this.points[neighbor*2], this.points[neighbor*2+1], 4, 0, Math.PI * 2);
			ctx.fill();
		}
		this.drawCellWithFill(point, "#00ffdc7a");
		this.drawTriangles();
		this.drawCells();
		this.drawPoints();
		ctx.restore();
	}

	drawTriangles() {
		var ctx = Game.context;
		ctx.save();
		ctx.strokeStyle = "black";
		ctx.stroke(this.#_path.deli);
		ctx.restore();
	}

	drawCellWithFill(cell, fill_color) {
		const vertices = this.#_voronoi.cellPolygon(cell);
		const ctx = Game.context;
		ctx.save();
		ctx.fillStyle = fill_color;
		ctx.beginPath();
		if(vertices.length > 0) {
			ctx.moveTo(vertices[0][0], vertices[0][1]);
		}
		for (var i = 1; i < vertices.length; i++) {
			ctx.lineTo(vertices[i][0],vertices[i][1]);
		}
		if(vertices.length > 0) {
			ctx.lineTo(vertices[0][0], vertices[0][1]);
			ctx.fill();
		}
		ctx.restore();
	}

	drawCells() {
		var ctx = Game.context;
		ctx.save();
		ctx.strokeStyle = "red";
		ctx.stroke(this.#_path.voronoi);
		ctx.restore();

	}

	drawPoints(rad=2) {
		var ctx = Game.context;
		ctx.save();
		ctx.fillStyle = "#ff0000";
		for (var i = 0; i < this.points.length; i+=2) {
			ctx.beginPath();
			ctx.arc(this.points[i], this.points[i+1], rad, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
	}

	randomize(radius=50) {
		var randomizer = poissonDiscSampler(Game.width+this.#_margin_bleed, Game.height+this.#_margin_bleed, radius)
		var width = Game.width;
		var height = Game.height;
		const a = [];
		var rando = undefined;
		outerloop: while(1){
			do{
				rando = randomizer.next().value;
				if(rando == undefined) {break outerloop;}
				rando = rando["add"];
			}while(rando == undefined)
			if(rando[0] > Game.width + this.#_margin_bleed/2 ||
			   rando[0] < -this.#_margin_bleed/2 ||
		   	   rando[1] > Game.height + this.#_margin_bleed/2 ||
		       rando[1] < -this.#_margin_bleed/2) {
				   continue;
			   }
			a.push([Math.round(rando[0])-this.#_margin_bleed/2, Math.round(rando[1])-this.#_margin_bleed/2]);
		}
		this.#_deli = Delaunay.from(a);
		this.#_voronoi = this.#_deli.voronoi([0,0,Game.width, Game.height]);
		this.#_path.deli = new Path2D(this.#_deli.render());
		this.#_path.voronoi = new Path2D(this.#_voronoi.render());
	}
}

function* poissonDiscSampler(width, height, radius) {
	const k = 4; // maximum number of samples before rejection
	const radius2 = radius * radius;
	const cellSize = radius * Math.SQRT1_2;
	const gridWidth = Math.ceil(width / cellSize);
	const gridHeight = Math.ceil(height / cellSize);
	const grid = new Array(gridWidth * gridHeight);
	const queue = [];
	const pRNG = new Alea(Game.seed);

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

module.exports = MapManager;
