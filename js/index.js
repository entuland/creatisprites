var utils = {
	findSpriteByIndex: function(set, index) {
		for(var i in icondata) {
			var sprite = icondata[i];
			if(sprite.s == set && sprite.id == index) {
				return sprite;
			}
		}
		return false;
	},
	
	findSpriteByName: function(set, name) {
		for(var i in icondata) {
			var sprite = icondata[i];
			if(sprite.s == set && sprite.i == name) {
				return sprite;
			}
		}
		return false;
	},
};

var design = {
	side: 64,
	
	init: function() {
		design.slots = [];
		design.importSprites = document.querySelector('#importsprites');
		design.appendSpace = document.querySelector('#appendspace');
		design.outputName = document.querySelector('#outputname');
		design.freeMode = document.querySelector('#freemode');
		design.fourMode = document.querySelector('#fourmode');
		design.columns = document.querySelector('#columns');
		design.rows = document.querySelector('#rows');
		design.addIntro = document.querySelector('#addintro');
		design.clearText = document.querySelector('#cleartext');
		design.output = document.querySelector('#output');
		design.disposition = document.querySelector('#disposition');
		design.checkControls();
		design.freeMode.addEventListener('change', design.checkControls);
		design.importSprites.addEventListener('click', design.importFromOutput);
		
		design.clearText.addEventListener('click', function() {
			design.output.value = '';
		});
		
		design.columns.addEventListener('input', design.checkSizes);
		design.rows.addEventListener('input', design.checkSizes);
		design.fourMode.addEventListener('change', design.checkSizes);
		
		design.addIntro.addEventListener('click', design.addIntroHandler);
		design.checkSizes();
		design.disposition.addEventListener('mousedown', design.mouseDown);
		document.addEventListener('mousemove', design.mouseMove);
		document.addEventListener('mouseup', design.mouseUp);
	},
	
	importFromOutput: function() {
		var text = design.output.value.replace(/[\r\n]/g, '');
		var tags = text.split('<');
		for(var t in tags) {
			var tag = tags[t];
			if(tag.indexOf('sprite') !== 0) {
				continue;
			}
			var parts = tag.split(' ');
			var set = parts[0].substr(14, 2);
			var sprite = false;
			if(parts[1].indexOf('name') === 0) {
				var name = parts[1].replace(/name="(.+)">/, '$1'); 
				sprite = utils.findSpriteByName(set, name);
			} else if(parts[1].indexOf('index') === 0) {
				var index = parts[1].replace(/index=(.+)>/, '$1'); 
				sprite = utils.findSpriteByIndex(set, index);
			}
			if(sprite) {
				design.addSprite(JSON.stringify(sprite));
			}
		}
	},
	
	addSprite: function(sprite) {
		for(var i = 0; i < design.slots.length; ++i) {
			var slot = design.slots[i];
			if(slot.dataset.sprite == "none" || i == design.slots.length - 1) {
				slot.dataset.sprite = sprite;
				design.applyGraphic(slot);
				return;
			}
		}
		
	},
	
	generateOutput: function() {
		if(design.freeMode.checked) {
			return;
		}
		var output = '<#0000>';
		var col = 0;
		var cols = parseInt(design.columns.value);
		if(design.fourMode.checked) {
			cols *= 2; 
		}
		for(var i in design.slots) {
			if(col % cols == 0) {
				output += '\r\n';
			}
			++col;
			var slot = design.slots[i];
			if(slot.dataset.sprite == 'none') {
				output += '.';
			} else {
				var sprite = JSON.parse(slot.dataset.sprite);
				if(pack.useIndices.checked) {
					output += '<sprite="icons_' + sprite.s + '" index=' + sprite.id + '>';
				} else {
					output += '<sprite="icons_' + sprite.s + '" name="' + sprite.i + '">';
				}
			}
		}
		design.output.value = output;
		design.addIntroHandler();
	},
	
	applyGraphic: function(slot) {
		var content = slot.children[0];
		content.style.left = 0;
		content.style.top = 0;
		content.style.zIndex = '10';
		if(slot.dataset.sprite == 'none') {
			content.style.display = 'none';
		} else {
			content.style.display = 'block';
			var sprite = JSON.parse(slot.dataset.sprite);
			var ratio = design.side / 128;
			var x = sprite.x * ratio;
			var	y = (4096 - sprite.y - sprite.h) * ratio;
			content.style.backgroundSize = 4096 * ratio + "px auto";
			if(sprite.s === "01") {
				content.style.backgroundSize = 2048 * ratio + "px auto";
				y = (2048 - sprite.y - sprite.h) * ratio;
			}
			var internal = sprite.i;
			var visible = sprite.v
			content.title = visible + ', ' + internal + ', icons_' + sprite.s + ', index ' + sprite.id + ' (click and drag to move, drag out to remove)';
			content.style.backgroundImage = 'url(img/icons_' + sprite.s + '.jpg)';
			content.style.backgroundPosition = '-' + x + 'px -' + y + 'px';
		}
		design.generateOutput();
	},
	
	mouseDown: function(e) {
		if(e.target.classList.contains('slot')) {
			return;
		}
		var content = e.target;
		var slot = e.target.parentNode;
		content.style.zIndex = '20';
		design.moving = slot;
	},
	
	mouseUp: function() {
		if(!design.moving) {
			return;
		}
		document.getSelection().removeAllRanges();
		if(design.swap == 'delete') {
			design.moving.dataset.sprite = 'none';
		} else if(design.swap) {
			var temp = design.swap.dataset.sprite;
			design.swap.dataset.sprite = design.moving.dataset.sprite;
			design.moving.dataset.sprite = temp;
			design.applyGraphic(design.swap);
		}
		design.applyGraphic(design.moving);
		design.moving = false;
	},
	
	getCoords: function(slot) {
		var rect = slot.getBoundingClientRect();
		rect.x += window.scrollX;
		rect.y += window.scrollY;
		return rect;
	},
	
	mouseMove: function(e) {
		if(!design.moving) {
			return;
		}
		var slot = design.moving;
		var global = design.getCoords(design.disposition);
		var x = e.pageX;
		var y = e.pageY;
		var local = design.getCoords(slot);
		var content = slot.children[0];
		content.style.left = x - local.x - design.side / 2 + 'px';
		content.style.top = y - local.y - design.side / 2 + 'px';
		if(x < global.x || y < global.y || x > global.x + global.width || y > global.y + global.height) {
			design.swap = 'delete';
			return;
		}
		content.style.cursor = 'move';
		for(var i in design.slots) {
			var check = design.slots[i];
			if(check === slot) {
				continue;
			}
			var local = design.getCoords(check);
			if(local.x < x && x < local.x + design.side && local.y < y && y < local.y + design.side) {
				design.swap = check;
				return;
			}	
		}
		design.swap = false;
	},
	
	resizeArea: function(rows, cols) {
		var dispo = design.disposition; 
		var slots = design.slots;
		slots.length = 0;
		dispo.innerHTML = '';
		dispo.style.width = design.side * cols + "px";
		dispo.style.height = design.side * rows + "px";
		var total = rows * cols;
		if(design.fourMode.checked) {
			total *= 4;
			dispo.style.width = design.side * 2 * cols + "px";
			dispo.style.height = design.side * 2 * rows + "px";
		}
		for(var i = 0; i < total; ++i) {
			var slot = design.createSlot();
			var content = slot.children[0];
			slots.push(slot);
			var d = design.side;
			if(design.fourMode.checked) {
				var oddRow = 0 == Math.floor(i / (cols * 2)) % 2;
				var oddCol = 0 == i % (cols * 2) % 2;
				switch(true) {
					case oddRow && oddCol:
						slot.style.borderWidth = "1px 0 0 1px";
						break;
					case oddRow && !oddCol:
						slot.style.borderWidth = "1px 1px 0 0";
						break;
					case !oddRow && oddCol:
						slot.style.borderWidth = "0 0 1px 1px";
						break;
					case !oddRow && !oddCol:
						slot.style.borderWidth = "0 1px 1px 0";
						break;
				}
			}
			slot.style.width = d + "px";
			slot.style.height = d + "px";
			content.style.width = (d-2) + "px";
			content.style.height = (d-2) + "px";
		}
	},
	
	createSlot: function() {
		var slot = document.createElement('div');
		slot.classList.add('slot');
		slot.dataset.sprite = "none";
		var content = document.createElement('div');
		content.classList.add('slot-content');
		slot.appendChild(content);
		design.disposition.appendChild(slot);
		return slot;
	},
	
	checkSizes: function() {
		var cols = design.columns.value;
		if(!cols) {
			cols = 1;
		}
		cols = parseInt(cols);
		if(cols % 2 != 1) {
			cols += 1;
		}
		if(cols < 1) {
			cols = 1;
		}
		if(cols > 7) {
			cols = 7;
		}
		design.columns.value = cols;
		
		var rows = design.rows.value;
		if(!rows) {
			rows = 1;
		}
		rows = parseInt(rows);
		if(rows < 1) {
			rows = 1;
		}
		if(rows > 7) {
			rows = 7;
		}
		design.rows.value = rows;
		design.resizeArea(rows, cols);
		design.generateOutput();
	},
	
	addIntroHandler: function() {
		var intro = '';
		if(design.fourMode.checked) {
			intro += '<size=4><mspace=0.5><line-height=0.48>';
			intro += '<offset=0.85>';
		} else {
			intro += '<size=8><mspace=1><line-height=0.99>';
			intro += '<offset=1.15>';
		}
		intro += '<zoffset=0.5><width=8>';
		design.output.value = intro + design.output.value;
	},
	
	checkControls: function() {
		if(design.freeMode.checked) {
			design.columns.parentNode.style.display = 'none';
			design.rows.parentNode.style.display = 'none';
			design.importSprites.style.display = 'none';
			design.disposition.style.display = 'none';
			
			design.appendSpace.parentNode.style.display = 'inline-block';
			design.outputName.parentNode.style.display = 'inline-block';
			design.clearText.style.display = 'inline-block';
			design.addIntro.style.display = 'inline-block';
		} else {
			design.columns.parentNode.style.display = 'inline-block';
			design.rows.parentNode.style.display = 'inline-block';
			design.importSprites.style.display = 'inline-block';
			design.disposition.style.display = 'block';
			
			design.appendSpace.parentNode.style.display = 'none';
			design.outputName.parentNode.style.display = 'none';
			design.clearText.style.display = 'none';
			design.addIntro.style.display = 'none';
		}
		design.output.value = '';
	}
};

var pack = {
	
	preload: function() {
		var icons00 = new Image();
		icons00.onload = function() {
			var icons01 = new Image();
			icons01.onload = pack.init;
			icons01.src = 'img/icons_01.jpg';
		};
		icons00.src = 'img/icons_00.jpg';			
	},
	
	init: function() {
		design.init();
		pack.recentFirst = document.querySelector('#recentfirst');
		pack.useIndices = document.querySelector('#useindices');
		pack.picker = document.querySelector('#picker');
		pack.list = document.querySelector('#list');
		pack.heading = document.querySelector('#heading');
		
		pack.pickerList = document.querySelector('#picker-list');
		
		pack.output = document.querySelector('#output');
		pack.tablemode = false;
		pack.switcher = document.querySelector('#switch');
		pack.filter = document.querySelector('#filter');
		pack.info = document.querySelector('#info');
		pack.infoButton = document.querySelector('#info-button');
		pack.infoCover = document.querySelector('#info-cover');
		pack.infoContent = document.querySelector('#info-content');
		
		document.querySelector('#preload-cover').style.display = 'none';
		
		pack.infoCover.addEventListener('click', function() {
			pack.infoCover.style.display = 'none';
			pack.infoContent.style.display = 'none';
		});
		
		pack.infoButton.addEventListener('click', function() {
			pack.infoCover.style.display = 'block';
			pack.infoContent.style.display = 'block';			
		});
		
		pack.output.addEventListener('focus', function() {
			this.select();
		});

		pack.switcher.addEventListener('click', function() {
			if(pack.tablemode) {
				pack.list.style.display = 'none';
				pack.picker.style.display = 'block';
				pack.switcher.innerText = 'Switch to List View';
			} else {
				pack.list.style.display = 'block';
				pack.picker.style.display = 'none';
				pack.switcher.innerText = 'Switch to Grid View';
			}
			pack.tablemode = !pack.tablemode;
		});

		pack.adaptPickerList();
		pack.createGrid();
		pack.createTable();

		pack.filter.addEventListener('input', pack.deferredFilter);
		window.addEventListener('resize', pack.adaptPickerList);
	},
	
	adaptPickerList: function() {
		pack.pickerList.style.top = pack.heading.clientHeight + 'px';
	},
	
	append: function(sprite, parent) {
		var icon = document.createElement('div');
		icon.innerHTML = '&nbsp;';
		var container = document.createElement('div');		
		
		icon.style.backgroundImage = 'url(img/icons_' + sprite.s + '.jpg)';
		container.style.backgroundImage = 'url(img/icons_' + sprite.s + '.jpg)';
		
		var x = sprite.x;
		var	y = 4096 - sprite.y - sprite.h;
		if(sprite.s === "01") {
			y = 2048 - sprite.y - sprite.h;
		}
		var off = 14;
		
		icon.style.backgroundPosition = '-' + x + 'px -' + y + 'px';
		container.style.backgroundPosition = '-' + (x + off) + 'px -' + (y + off) + 'px';

		container.appendChild(icon);
		icon.classList.add('icon');
		var internal = sprite.i;
		var visible = sprite.v

		icon.title = visible + ', ' + internal + ', icons_' + sprite.s + ', index ' + sprite.id + ' (Click to add to the output textarea)';
		container.classList.add('container');
		icon.dataset.index = sprite.id;
		icon.dataset.set = sprite.s;
		icon.dataset.visible = visible;
		icon.dataset.internal = internal;
		parent.appendChild(container);
		
		icon.addEventListener('click', pack.clickListener);
		icon.dataset.sprite = JSON.stringify(sprite);
		container.dataset.search_name = internal.toLowerCase() + " " + visible.toLowerCase();
	},
	
	clickListener: function() {
		if(pack.recentFirst.checked) {
			var tableOne = document.querySelector("#list [data-set='" + this.dataset.set + "'][data-index='" + this.dataset.index + "']");
			pack.list.insertBefore(tableOne.closest("tr"), pack.list.firstChild);
			var pickOne = document.querySelector("#picker [data-set='" + this.dataset.set + "'][data-index='" + this.dataset.index + "']");
			pack.picker.insertBefore(pickOne.closest(".container"), pack.picker.firstChild);
		}
		if(design.freeMode.checked) {
			if(design.outputName.checked) {
				pack.output.value += this.dataset.visible + ' ';
			}
			if(pack.useIndices.checked) {
				pack.output.value += '<sprite="icons_' + this.dataset.set + '" index=' + this.dataset.index + '>';
			} else {
				pack.output.value += '<sprite="icons_' + this.dataset.set + '" name="' + this.dataset.internal + '">';
			}
			if(design.appendSpace.checked) {
				pack.output.value += ' ';
			}	
		} else {
			design.addSprite(this.dataset.sprite);
		}
	},
	
	createGrid: function() {
		for(var i in icondata) {
			pack.append(icondata[i], picker);				
		}
	},
	
	createTable: function() {
		for(var i in icondata) {
			var sprite = icondata[i];
			
			var tr = document.createElement('tr');
			var descriptionCell = document.createElement('td');
			var iconCell = document.createElement('td');
			var inameCell = document.createElement('td');
			var vnameCell = document.createElement('td');
			var iconCell = document.createElement('td');
			
			var internal = sprite.i;
			var visible = sprite.v;
			
			descriptionCell.innerHTML = "Set: <strong>icons_" + sprite.s + "</strong> "
										+ "Index: <strong>" + sprite.id + "</strong><br>"
										+ "Internal Name: <strong>" + sprite.i + "</strong><br>"
										+ "Visible Name: <strong>" + sprite.v + "</strong>";
			
			tr.appendChild(descriptionCell);
			tr.appendChild(iconCell);
			
			pack.list.appendChild(tr);
			
			pack.append(sprite, iconCell);
			tr.dataset.search_name = internal.toLowerCase() + " " + visible.toLowerCase();
		}
	},
	
	deferredFilter: function() {
		clearTimeout(pack.deferredFilter.timeout);
		pack.deferredFilter.timeout = setTimeout(function() {
			var lower = '';
			if(pack.filter.value) {
				lower = pack.filter.value.toLowerCase();				
			}
			var containers = Array.from(document.querySelectorAll('.container'));
			var rows = Array.from(document.querySelectorAll('tr'));
			var elements = containers.concat(rows);
			for(var i = 0; i < elements.length; ++i) {
				var el = elements[i];
				if(!pack.filter.value || el.dataset.search_name.indexOf(lower) != -1) {
					el.style.display = '';
				} else {
					el.style.display = 'none';
				}
			}
		}, 500);
	},
};

window.addEventListener('load', pack.preload);
