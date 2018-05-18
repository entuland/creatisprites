var failing = {
	'00': [252, 753, 754, 755, 756, 757, 758, 759, 760, 761, 762, 763, 764, 765, 766, 767, 788, 789, 790, 791, 792,],
	'01': [39],
};

function mainIndex() {
	
	function appendIcon(set, i, parent) {
		var icon = document.createElement('div');
		icon.innerHTML = '&nbsp;';
		var container = document.createElement('div');		

		
		var range = Math.floor(i / 100) * 100;
		
		var ind = i - range;
		
		var x = ind % 10;
		var y = Math.floor(ind / 10);
		
		if(!range) {
			range = '000';
		}
		
		icon.style.backgroundImage = 'url(img/128/' + set + '-' + range + '.jpg)';
		container.style.backgroundImage = 'url(img/96/' + set + '-' + range + '.jpg)';
		
		icon.style.backgroundPosition = '-' + (x * 128) + 'px -' + (y * 128) + 'px';
		container.style.backgroundPosition = '-' + (x * 96) + 'px -' + (y * 96) + 'px';


		container.appendChild(icon);
		icon.classList.add('icon');
		var internal_name = icondata[set][i].i;
		var name = icondata[set][i].v;
		var visible = name;
		if(!visible) {
			visible = '(' + internal_name + '?)';
		}

		icon.title = visible + ', icons_' + set + ', index ' + i + ' (Click to add to the output textarea)';
		container.classList.add('container');
		icon.dataset.index = i;
		icon.dataset.set = set;
		icon.dataset.name = visible;
		parent.appendChild(container);
		icon.addEventListener('click', function() {
			if(document.querySelector('#outputname').checked) {
				output.value += this.dataset.name + ' ';
			}
			var i = parseInt(this.dataset.index);
			output.value += '<sprite="icons_' + this.dataset.set + '" index=' + i + '> ';
		});
		container.dataset.name = visible.toLowerCase();
	}

	function createGrid() {
		for(var set in icondata) {
			console.log(set);
			for(var i in icondata[set]) {
				appendIcon(set, i, picker);				
			}
		}
	}

	function createTable() {
		for(var set in icondata) {
			for(var i in icondata[set]) {
				var tr = document.createElement('tr');
				var iconsetCell = document.createElement('td');
				var indexCell = document.createElement('td');
				var nameCell = document.createElement('td');
				var iconCell = document.createElement('td');
				
				iconsetCell.innerText = '00';
				indexCell.innerText = i;
				var internal_name = icondata[set][i].i;
				var name = icondata[set][i].v;
				var visible = name;
				if(!visible) {
					visible = '(' + internal_name + '?)';
				}
				
				nameCell.innerText = visible;	
				
				tr.appendChild(iconsetCell);
				tr.appendChild(indexCell);
				tr.appendChild(nameCell);
				tr.appendChild(iconCell);
				
				list.appendChild(tr);
				
				appendIcon(set, i, iconCell);
				tr.dataset.name = visible.toLowerCase();
			}
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
}

window.addEventListener('load', mainIndex);
