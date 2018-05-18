var failing = [
	252, 
	753, 754, 755, 756, 757, 758, 759, 
	760, 761, 762, 763, 764, 765, 766, 767,
	788, 789, 790, 791, 792,
];

function mainIndex() {
	
	function appendIcon(i, parent) {
		var xy = coords[i];		
		var icon = document.createElement('div');
		icon.innerHTML = '&nbsp;';
		var container = document.createElement('div');		

		icon.style.backgroundPosition = '-' + (xy.x * 129) + 'px -' + (xy.y * 129 + 98) + 'px';
		container.style.backgroundPosition = '-' + (xy.x * 96.75) + 'px -' + (xy.y * 96.75 + 73.5) + 'px';


		container.appendChild(icon);
		icon.classList.add('icon');
		var name = names00[i];
		icon.title = name + ', icons_00, index ' + i + ' (Click to add to the output textarea)';
		container.classList.add('container');
		icon.dataset.index = i;
		icon.dataset.set = '00';
		icon.dataset.name = name;
		parent.appendChild(container);
		icon.addEventListener('click', function() {
			if(document.querySelector('#outputname').checked) {
				output.value += this.dataset.name + ' ';
			}
			var i = parseInt(this.dataset.index);
			if(failing.indexOf(i) !== -1) {
				output.value += '[sprite="icons_' + this.dataset.set + '" index=' + i + ' FAIL, SORRY] ';
			} else if(i > 938) {
				output.value += '[sprite="icons_' + this.dataset.set + '" index=' + i + ' MISSING, SORRY] ';
			} else {
				output.value += '<sprite="icons_' + this.dataset.set + '" index=' + i + '> ';
			}
		});
		container.dataset.name = name.toLowerCase();
	}

	function createGrid() {
		for(var i = 0; i < 960; ++i) {
			appendIcon(i, picker);
		}	
	}

	function createTable() {
		for(var i = 0; i < 960; ++i) {
			var tr = document.createElement('tr');
			var iconsetCell = document.createElement('td');
			var indexCell = document.createElement('td');
			var nameCell = document.createElement('td');
			var iconCell = document.createElement('td');
			
			iconsetCell.innerText = '00';
			indexCell.innerText = i;
			nameCell.innerText = names00[i];
			
			tr.appendChild(iconsetCell);
			tr.appendChild(indexCell);
			tr.appendChild(nameCell);
			tr.appendChild(iconCell);
			
			list.appendChild(tr);
			
			appendIcon(i, iconCell);
			tr.dataset.name = names00[i].toLowerCase();
		}
	}

	function deferredFilter() {
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			var lower = '';
			if(filter.value) {
				lower = filter.value.toLowerCase();				
			}
			var containers = Array.from(document.querySelectorAll('.container'));
			var rows = Array.from(document.querySelectorAll('tr'));
			var elements = containers.concat(rows);
			for(var i = 0; i < elements.length; ++i) {
				var el = elements[i];
				if(!filter.value || el.dataset.name.indexOf(lower) != -1) {
					el.style.display = '';
				} else {
					el.style.display = 'none';
				}
			}
		}, 500);
	}

	var coords = [];

	for(var y = 0; y < 31; ++y) {
		for(var x = 0; x < 31; ++x) {
			var index = indices00[y][x];
			if(index < 0) {
				continue;
			}
			coords[index] = {x: x, y: y};
		}
	}

	var picker = document.querySelector('#picker');
	var output = document.querySelector('#output');
	var list = document.querySelector('#list');
	output.addEventListener('focus', function() {
		this.select();
	});

	var tablemode = false;

	var switcher = document.querySelector('#switch');

	switcher.addEventListener('click', function() {
		if(tablemode) {
			list.style.display = 'none';
			picker.style.display = 'block';
			switcher.innerText = 'Switch to List View';
		} else {
			list.style.display = 'block';
			picker.style.display = 'none';
			switcher.innerText = 'Switch to Grid View';
		}
		tablemode = !tablemode;
	});

	createGrid();
	createTable();

	var timeout = 0;

	var filter = document.querySelector('#filter');

	filter.addEventListener('input', deferredFilter);
	document.querySelector('#loading').style.display = 'none';
}

function preloader() {
	var reduced = new Image();
	reduced.onload = function() {
		var fullsize = new Image();
		fullsize.onload = function() {
			mainIndex();
		};
		fullsize.src = 'img/icons_00.jpg';
	};
	reduced.src = 'img/icons_00_reduce.jpg';
}

window.addEventListener('load', preloader);
