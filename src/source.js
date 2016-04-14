var Button = ReactBootstrap.Button;

var Box = React.createClass({
	getInitialState() {
		return {
			type: this.props.type
		}
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({
			type: nextProps.type
		})
	},

	render: function() {
		var x = this.props.x;
		var y = this.props.y;
		var coords = this.props.playerXY;

		var dark = this.props.darkness;
		var xdistance = Math.abs(coords[0] - x);
		var ydistance = Math.abs(coords[1] - y);
		var distance = xdistance + ydistance;

		if (xdistance < 6 && ydistance < 6 & distance < 8) {
			dark = false;
		}

		var cssClass = this.state.type
		if (dark) {
			cssClass += ' dark';
		}
		return (
			<td className = { cssClass } />
		)
	}
});

var Row = React.createClass({
	getInitialState() {
		return {
			content: this.props.content
		}
	},

	render: function() {
		var boxes = [];
		var content = this.props.content;

		for (var i = 0; i < content.length; i++) {
			boxes.push(<Box type = { content[i] }
							playerXY = { this.props.playerXY }
							x = { this.props.x }
							y = { i }
							darkness = { this.props.darkness }
							key = { i } />)
		}

		return (
			<tr>
				{ boxes }
			</tr>
		)
	}
});

var Page = React.createClass({
	getInitialState() {
		return {
			board: this.props.board,
			numRows: this.props.numRows,
			numColumns: this.props.numColumns,
			playerXY: this.props.playerXY,
			weapon: 0,
			health: 100,
			xp: 0,
			dungeon: 0,
			win: false,
			darkness: true,
			gameover: false
		}
	},

	componentDidMount: function() {
		$(document.body).on('keydown', this.movePlayer);
	},

	movePlayer: function(e){
		var code = e.keyCode;
		if (code >= 37 && code <= 40) {
			e.preventDefault();
		} else {
			return;
		}

		var playerXY = this.state.playerXY;
		var x = playerXY[0];
		var y = playerXY[1];
		var newPosition;

		if (code === 38) {
			newPosition = [x - 1, y]
		} else if (code === 40) {
			newPosition = [x + 1, y]
		} else if (code === 37) {
			newPosition = [x, y-1]
		} else if (code === 39) {
			newPosition = [x, y+1]
		} else {
			return;
		}

		var board = this.state.board;

		// error handling for x or y being out of range (less than zero, greater than .length)
		if (board[newPosition[0]][newPosition[1]] === 'weapon') {
			this.upgradeWeapon();
		} else if (board[newPosition[0]][newPosition[1]] === 'health') {
			this.updateHealth();
		} else if (board[newPosition[0]][newPosition[1]] === 'monster') {
			var killed = this.attack(newPosition);
			if (!killed) { return; }
			monstersKilled += 1;
			if (monstersKilled === monsters.length) {
				this.setState({
					gameover: true,
					winner: true
				})
			}
		} else if (board[newPosition[0]][newPosition[1]] !== 'open') {
			// add one for portal, if the goal is to get to a certain dungeon
			return;
		}

		board[playerXY[0]][playerXY[1]] = 'open';
		board[newPosition[0]][newPosition[1]] = 'player';

		this.setState({
			playerXY: newPosition,
			board: board
		})
	},

	darkness: function() {
		var dark = !this.state.darkness
		this.setState({ darkness: dark })
	},

	upgradeWeapon: function() {
		var current = this.state.weapon;
		current += 1;
		this.setState({ weapon: current });
	},

	attack: function(newPosition) {
		var attack = Math.ceil(Math.random() * weapons[this.state.weapon].power)
		console.log('attack', attack)
		var monsterID = monsters.findIndex(function(obj){
			return obj.coords[0] == newPosition[0] && obj.coords[1] == newPosition[1];
		})
		console.log('monster life', monsters[monsterID].life)

		if (attack >= monsters[monsterID].life) {
			monsters[monsterID].life = 0;
			var xp = this.state.xp + monsters[monsterID].xp
			this.setState({ xp: xp })
			return true;
		} else {
			monsters[monsterID].life -= attack;
			var counterAttack = Math.ceil(Math.random() * monsters[monsterID].strength)
			console.log('counter', counterAttack)
			var health = this.state.health - counterAttack;
			if (health <= 0) {
				this.setState({
					gameover: true,
					winner: false,
				 	health: 0 })
				return;
			}
			this.setState({ health: health })
			return false;
		}

		// gameOver() or remove the enemy
		// update health, xp
	},

	updateHealth: function() {
		var health = Math.floor(Math.random() * 10) + 15;
		var current = this.state.health + health;
		this.setState({ health: current })
	},

	updateXP: function(gained) {
		// xp from state += gained
		// do level math
		// update state (xp, level)

	},

	render: function() {

		var rows = [];

		for (var i = 0; i < this.state.numRows; i++ ) {
			rows.push(<Row
				content = { this.state.board[i] }
				playerXY = { this.state.playerXY }
				darkness = { this.state.darkness }
				x = { i }
				key = { i } />)
		}

		var weapon = weapons[this.state.weapon];
		var level = Math.floor(this.state.xp / 50);

		return (
			<div className='container'>
				<h1>Dungeon Fungeon</h1>
				<div>
					<ul id = 'status'>
						<li>Health: <span id = 'health'>{ this.state.health }</span></li>
						<li>Weapon: <span id = 'weapon-name'>{ weapon.name }</span></li>
						<li>Attack: <span id = 'attack'>{ weapon.power }</span></li>
						<li>Level: <span id = 'level'>{ level }</span></li>
						<li>XP: <span id = 'xp'>{ this.state.xp }</span></li>
						<li>Dungeon: <span id = 'dungeon'>{ this.state.dungeon }</span></li>
						<li><Button bsStyle = 'default' onClick = { this.darkness }>Toggle Darkness</Button></li>
					</ul>
				</div>
				<div id = 'game-container'>
					<div id = 'gameover' className = { this.state.gameover ? '' : 'hidden' }>
						<h1>{ this.state.winner ? 'You win!' : 'You Lose!' }</h1>
						<h2>Reload to play again.</h2>
					</div>
					<table>
						<tbody>
							{ rows }
						</tbody>
					</table>
				</div>
				<div className='row'>
					<div id = 'rules' className = 'col-sm-8 col-sm-offset-2'>
						<h4>Basic rules:</h4>
						<ul>
							<li>You are blue. Arrow keys move.</li>
							<li>Health is green. Weapon upgrades are yellow.</li>
							<li>Kill monsters. They're red. Get 'em all to win.</li>
						</ul>
					</div>
				</div>
			</div>
		)
	}
});

var weapons = [{
		'name': 'fists',
		'power': 3
	},
	{
		'name': 'crowbar',
		'power': 5
	},
	{
		'name': 'sword',
		'power': 10
	},
	{
		'name': 'pistol',
		'power': 15
	},
	{
		'name': 'shotgun',
		'power': 25
	}];

var playerXY;
var placeObject = function(objName, board) {
	var x = Math.floor(Math.random() * numRows);
	var y = Math.floor(Math.random() * numColumns);

	if (board[x][y] === 'open') {
		board[x][y] = objName;
		if (objName === 'player') {
			playerXY = [x, y];
		}

		if (objName === 'monster') {
			var life = Math.floor(Math.random() * 25) + 1;
			var strength = Math.floor(Math.random() * 15) + 1;
			monsters.push({
				'strength': strength,
				'coords': [x, y],
				'life': life,
				'xp': life
			})
		}
		return board;
	} else {
		placeObject(objName, board);
		return board;
	}
}

// TODO: add multiple board options select a random one to use
var board1 = [
	['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall'],
	['wall','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall'],
	['wall','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall'],
	['wall','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall'],
	['wall','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','wall'],
	['wall','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','wall'],
	['wall','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','wall'],
	['wall','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','wall'],
	['wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','wall'],
	['wall','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','wall'],
	['wall','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','wall','wall','wall','open','open','open','wall'],
	['wall','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','wall','wall','wall','wall','open','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','wall','wall','wall','wall','wall','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','open','wall'],
	['wall','wall','wall','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','wall','wall','wall','wall','wall','open','wall'],
	['wall','wall','wall','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','wall','wall','wall','wall','wall','open','wall'],
	['wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','wall','wall','wall','wall','wall','open','wall'],
	['wall','wall','wall','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','wall'],
	['wall','wall','wall','open','open','open','open','open','open','open','open','open','open','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','wall','wall','wall','wall','wall','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','wall','wall','wall','wall','wall','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','wall','wall','wall','wall','wall','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','wall','wall','wall','wall','wall','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','wall','wall','open','wall','wall','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','wall','wall','open','wall','wall','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','wall'],
	['wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall'],
	['wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall'],
	['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall'],
	['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','open','open','open','open','open','open','open','open','open','open','open','open','open','open','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall'],
	['wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall','wall']];
var numRows = board1.length;
var numColumns = board1[0].length;

var monsters = [];
var monstersKilled = 0;

// set up the playing space
var setup = function(board) {
	board = placeObject('player', board);

	var monsters = 10;
	for (var i = 0; i < monsters; i++) {
		board = placeObject('monster', board);
	}

	var health = 5;
	for (var i = 0; i < health; i++) {
		board = placeObject('health', board);
	}

	var weaponUpgrade = 4;
	for (var i = 0; i < weaponUpgrade; i++) {
		board = placeObject('weapon', board);
	}
	return board;
}

var board = setup(board1);

ReactDOM.render( < Page
						board = { board }
						playerXY = { playerXY }
						numRows = { numRows }
						numColumns = { numColumns } />,
  	document.getElementById('container'));
