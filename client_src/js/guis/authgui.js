const SSM = require('../sprites/spritesheetmanager.js');
const SocketManager = require('../socketmanager.js');

class AuthGui {
	#_username_string = "";
	#_passwd_string = "";
	#_status_string = "";
	#_status_string_counter = 1;
	#_status_string_delay_counter = 1;
	#_status_string_delay_counter_max = 60;
	#_waiting_response = false;
	#_buffered_response = undefined;
	#_finished = false;

	#_last_mp;

	#text_box_height = 25;
	#text_box_width = 350;
	#text_box_start_height_offset = 200;
	#text_box_spacing = 50;
	#left_edge_text_box;
	#top_edge_first_text_box;
	#top_edge_second_text_box;

	#clickable_box_vertical_spacing;
	#clickable_box_top_edge;
	#clickable_box_height = 25;

	#loginbox_left_edge;
	#loginbox_width = 55;

	#registerbox_left_edge;
	#registerbox_width = 76;

	#_selected_box = 0;

	#callback;

	constructor () {
		this.start = this.start.bind(this);
		this.draw = this.draw.bind(this);
		this.updateInputs = this.updateInputs.bind(this);

		this.#clickable_box_vertical_spacing = this.#text_box_spacing;

		this.#left_edge_text_box = SSM.viewport.camera.width/2-this.#text_box_width/2;

		this.#top_edge_first_text_box = SSM.viewport.camera.height/2-this.#text_box_start_height_offset/4;

        this.#top_edge_second_text_box = this.#top_edge_first_text_box + this.#text_box_height + this.#text_box_spacing;

		this.#clickable_box_top_edge = this.#top_edge_second_text_box + this.#clickable_box_vertical_spacing;

		this.#loginbox_left_edge = this.#left_edge_text_box + this.#left_edge_text_box*3/16;

		this.#registerbox_left_edge = this.#left_edge_text_box + this.#left_edge_text_box*5/8;

		SocketManager.registerModule("auth_gui", this);
	}

	get logged_in() {
		return this.#_finished;
	}

	start(cb) {
		this.#_finished = false;
		this.#_status_string = "";
		this.#_username_string = "";
		this.#_passwd_string = "";
		this.#_status_string_counter = 1;
		this.#_status_string_delay_counter = 0;
		this.#_selected_box = 0;
		this.#_waiting_response = false;

		this.#_last_mp = {x: 0, y: 0};
		this.#callback = cb;
		if(this.#_buffered_response != undefined) {
			this.#_waiting_response = true;
			this.loginStatus(this.#_buffered_response);
		} else {
			window.addEventListener("mousemove", this.updateInputs);
	        window.addEventListener("mousedown", this.updateInputs);
			window.addEventListener("mouseup", this.updateInputs);
			window.addEventListener("keydown", this.updateInputs);
        	this.draw();
		}
	}

	updateInputs(e) {
		if(e && (e.type == "mousedown" || e.type == "mousemove" || e.type == "mouseup")){
			this.#_last_mp = SSM.viewport.camera.mouseToScreenSpace({x: e.clientX, y: e.clientY});
		}
		if(e && e.type == "mouseup") {
			if(this.#_selected_box==3 && this.#checkLoginBox()) {
				this.#login();
			} else if(this.#_selected_box==4 && this.#checkRegisterBox()) {
				this.#register();
			} else if(this.#_selected_box==3 || this.#_selected_box==4) {
				this.#_selected_box = 0;
			}
		}
		if(e && e.type == "mousedown") {
			if(this.#checkTextBoxOne()) {
				this.#_selected_box = 1;
			} else if(this.#checkTextBoxTwo()) {
				this.#_selected_box = 2;
			} else if(this.#checkLoginBox()) {
				this.#_selected_box = 3;
			} else if(this.#checkRegisterBox()) {
				this.#_selected_box = 4;
			} else {
				this.#_selected_box = 0;
			}
		}
		if(e && e.type == "keydown") {
			if(e.key == "Tab") {
				e.preventDefault();
				this.#_selected_box += 1;
				if(this.#_selected_box == 5) this.#_selected_box = 1;
			}
			else if(e.key == "Backspace") {
				if(this.#_selected_box == 1) {
					this.#_username_string = this.#_username_string.slice(0,-1);
				} else if(this.#_selected_box == 2) {
					this.#_passwd_string = this.#_passwd_string.slice(0,-1);
				}
			}
			else if(e.key == "Enter" && this.#_selected_box==3) {
				this.#login();
			}
			else if(e.key == "Enter" && this.#_selected_box == 4) {
				this.#register();
			}
			else if(e.key.length == 1) {
				if(this.#_selected_box == 1) {
					this.#_username_string += e.key;
				} else if(this.#_selected_box == 2) {
					this.#_passwd_string += e.key;
				}
			}
		}
		this.draw();
	}

	draw() {
		if(this.#_finished) {
			return
		}
		SSM.clearScreen(SSM.palette.menu_background_color);
        SSM.viewport.context.save();
		SSM.setDefaultFont(30);
		SSM.viewport.context.fillText("Wizerds.",SSM.viewport.camera.width/2, this.#top_edge_first_text_box - 50);
		SSM.setDefaultFont(24);
		if(this.#_waiting_response) {
			if(this.#_status_string_delay_counter == this.#_status_string_delay_counter_max) {
				this.#_status_string_counter += 1;
				if(this.#_status_string_counter == 4) this.#_status_string_counter = 1;
				this.#_status_string_delay_counter = 0;
			} else {
				this.#_status_string_delay_counter += 1;
			}
			SSM.viewport.context.fillText(this.#_status_string + ".".repeat(this.#_status_string_counter) + " ".repeat(3 - this.#_status_string_counter),SSM.viewport.camera.width/2, this.#clickable_box_top_edge+this.#clickable_box_height+this.#clickable_box_vertical_spacing);
		} else if (this.#_status_string) {
			SSM.viewport.context.fillText(this.#_status_string,SSM.viewport.camera.width/2, this.#clickable_box_top_edge+this.#clickable_box_height+this.#clickable_box_vertical_spacing);
		}
		SSM.setDefaultFont(24);
		SSM.viewport.context.textAlign = "left";
		SSM.viewport.context.fillText("Username:",this.#left_edge_text_box, this.#top_edge_first_text_box - 5);
		SSM.viewport.context.fillText("Password:",this.#left_edge_text_box, this.#top_edge_second_text_box - 5);
		if(this.#_selected_box == 1) {
			SSM.viewport.context.fillStyle = SSM.palette.selected_textfield_color;
		} else if(this.#checkTextBoxOne()) {
			SSM.viewport.context.fillStyle = SSM.palette.highlighted_textfield_color;
		} else {
			SSM.viewport.context.fillStyle = SSM.palette.unselected_textfield_color;
		}
		SSM.viewport.context.fillRect(this.#left_edge_text_box, this.#top_edge_first_text_box, this.#text_box_width, this.#text_box_height);
		if(this.#_selected_box == 2) {
			SSM.viewport.context.fillStyle = SSM.palette.selected_textfield_color;
		} else if(this.#checkTextBoxTwo()) {
			SSM.viewport.context.fillStyle = SSM.palette.highlighted_textfield_color;
		} else {
			SSM.viewport.context.fillStyle = SSM.palette.unselected_textfield_color;
		}
		SSM.viewport.context.fillRect(this.#left_edge_text_box, this.#top_edge_second_text_box, this.#text_box_width, this.#text_box_height);
		if(this.#_selected_box == 3) {
			SSM.viewport.context.fillStyle = SSM.palette.selected_textfield_color;
		} else if(this.#checkLoginBox()) {
			SSM.viewport.context.fillStyle = SSM.palette.highlighted_textfield_color;
		} else {
			SSM.viewport.context.fillStyle = SSM.palette.unselected_textfield_color;
		}
		SSM.viewport.context.fillRect(this.#loginbox_left_edge, this.#clickable_box_top_edge, this.#loginbox_width, this.#clickable_box_height);
		if(this.#_selected_box == 4) {
			SSM.viewport.context.fillStyle = SSM.palette.selected_textfield_color;
		} else if(this.#checkRegisterBox()) {
			SSM.viewport.context.fillStyle = SSM.palette.highlighted_textfield_color;
		} else {
			SSM.viewport.context.fillStyle = SSM.palette.unselected_textfield_color;
		}
		SSM.viewport.context.fillRect(this.#registerbox_left_edge, this.#clickable_box_top_edge, this.#registerbox_width, this.#clickable_box_height);
		SSM.setDefaultFont(18);
		SSM.viewport.context.textAlign = "left";
		SSM.viewport.context.fillStyle = "#000000";
		SSM.viewport.context.fillText(this.#_username_string, this.#left_edge_text_box + 5, this.#top_edge_first_text_box+this.#text_box_height*3/4);
		SSM.viewport.context.fillText("*".repeat(this.#_passwd_string.length), this.#left_edge_text_box + 5, this.#top_edge_second_text_box+this.#text_box_height*7/8);
		SSM.viewport.context.fillText("Login", this.#loginbox_left_edge + 5, this.#clickable_box_top_edge+18);
		SSM.viewport.context.fillText("Register", this.#registerbox_left_edge + 5, this.#clickable_box_top_edge+18);
		SSM.viewport.context.restore();
		if(this.#_waiting_response) {
			SSM.viewport.last_animation_request = window.requestAnimationFrame(this.draw);
		}
	}

	#checkTextBoxOne(mp) {
		return this.#_last_mp.x >= this.#left_edge_text_box &&
		       this.#_last_mp.x <= this.#left_edge_text_box + this.#text_box_width &&
			   this.#_last_mp.y >= this.#top_edge_first_text_box &&
			   this.#_last_mp.y <= this.#top_edge_first_text_box + this.#text_box_height
	}

	#checkTextBoxTwo(mp) {
		return this.#_last_mp.x >= this.#left_edge_text_box &&
		       this.#_last_mp.x <= this.#left_edge_text_box + this.#text_box_width &&
			   this.#_last_mp.y >= this.#top_edge_second_text_box &&
			   this.#_last_mp.y <= this.#top_edge_second_text_box + this.#text_box_height;
	}

	#checkLoginBox(mp) {
		return this.#_last_mp.x >= this.#loginbox_left_edge &&
		       this.#_last_mp.x <= this.#loginbox_left_edge + this.#loginbox_width &&
			   this.#_last_mp.y >= this.#clickable_box_top_edge &&
			   this.#_last_mp.y <= this.#clickable_box_top_edge + this.#clickable_box_height;
	}

	#checkRegisterBox(mp) {
		return this.#_last_mp.x >= this.#registerbox_left_edge &&
		       this.#_last_mp.x <= this.#registerbox_left_edge + this.#registerbox_width &&
			   this.#_last_mp.y >= this.#clickable_box_top_edge &&
			   this.#_last_mp.y <= this.#clickable_box_top_edge + this.#clickable_box_height;
	}

	#login() {
		SocketManager.sendLogin(this.#_username_string, this.#_passwd_string);
		this.#_status_string = "Logging in";
		this.#_status_string_counter = 1;
		this.#_status_string_delay_counter = 0;
		this.#_selected_box = 0;
		this.#_waiting_response = true;
		window.removeEventListener("mousemove", this.updateInputs);
        window.removeEventListener("mousedown", this.updateInputs);
		window.removeEventListener("mouseup", this.updateInputs);
		window.removeEventListener("keydown", this.updateInputs);
		SSM.viewport.last_animation_request = window.requestAnimationFrame(this.draw);
	}

	#register() {
		SocketManager.sendRegister(this.#_username_string, this.#_passwd_string);
		this.#_status_string = "Registering";
		this.#_status_string_counter = 1;
		this.#_status_string_delay_counter = 0;
		this.#_selected_box = 0;
		this.#_waiting_response = true;
		window.removeEventListener("mousemove", this.updateInputs);
        window.removeEventListener("mousedown", this.updateInputs);
		window.removeEventListener("mouseup", this.updateInputs);
		window.removeEventListener("keydown", this.updateInputs);
		SSM.viewport.last_animation_request = window.requestAnimationFrame(this.draw);
	}

	loginStatus(msg) {
		if(msg == 1) {
			//if we aren't waiting a response then we probably got cookie too early
			if(this.#_waiting_response) {
				window.cancelAnimationFrame(SSM.viewport.last_animation_request);
				this.#close();
			} else {
				this.#_buffered_response = msg;
			}
		} else {
			this.#_status_string = msg;
			window.addEventListener("mousemove", this.updateInputs);
			window.addEventListener("mousedown", this.updateInputs);
			window.addEventListener("mouseup", this.updateInputs);
			window.addEventListener("keydown", this.updateInputs);
			this.#_status_string_counter = 1;
			this.#_status_string_delay_counter = 0;
			this.#_selected_box = 0;
			this.#_waiting_response = false;
		}
	}

	#close() {
		this.#_username_string = "";
		this.#_passwd_string = "";
		this.#_finished = true;
		this.#_buffered_response = undefined;
		window.removeEventListener("mousemove", this.updateInputs);
        window.removeEventListener("mousedown", this.updateInputs);
		window.removeEventListener("mouseup", this.updateInputs);
		window.removeEventListener("keydown", this.updateInputs);
		this.#callback();
	}
}

module.exports = new AuthGui();
