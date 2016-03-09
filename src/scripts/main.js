"use strict";

var React = require('react');
var ReactDOM = require('react-dom');

// Dependencies
var Linkify = require('react-linkify');
var Packery = require('packery');

/* App */

var App = React.createClass({

	getInitialState: function() {
		return {
			lists: {}
		}
	},

	componentDidMount: function() {

		var localStorageRef = localStorage.getItem('lists');

		if ( localStorageRef && localStorageRef !== 'undefined' ) {
			this.setState({
				lists: JSON.parse(localStorageRef)
			});
		}

		setTimeout((function(){
			this.pckry = new Packery( '.vertasq', {
				itemSelector: '.list'
			});
		}).bind(this), 0);

	},

	componentWillUpdate: function(nextProps, nextState) {
		localStorage.setItem('lists', JSON.stringify(nextState.lists));
	},

	componentDidUpdate: function() {
		this.updatePackeryLayout(true);
	},

	updatePackeryLayout: function(reload) {
		setTimeout((function(){
			if ( reload ) 
				this.pckry.reloadItems();
			this.pckry.layout();
		}).bind(this), 0);
	},

	addList: function(e) {

		e.preventDefault();

		if ( this.refs.title.value == '' ) {
			alert('Please give this list a title!');
			return false;
		}

		this.state.lists['list-' + (new Date()).getTime()] = { title: this.refs.title.value };
		this.setState({ lists: this.state.lists });

		this.refs.listForm.reset();

	},

	removeList(key) {
		if ( confirm('Are you sure that you want to completely remove this list?') ) {
			delete this.state.lists[key];
			this.setState( {lists: this.state.lists });
		}
	},

	renderList: function(key) {
		var title = this.state.lists[key].title;
		return <List key={key} className="list" title={title} removeList={this.removeList.bind(null, key)} updatePackeryLayout={this.updatePackeryLayout} />
	},

	render: function() {
		return (
			<div className="vertasq">
				{Object.keys(this.state.lists).reverse().map(this.renderList)}
				<form className="list-form" ref="listForm" onSubmit={this.addList}>
					<input type="text" ref="title" placeholder="Write your list's title here" />
					<button type="submit" className="circleButton plus">+</button>
				</form>
			</div>
		);
	}

});

/* List */

var List = React.createClass({

	// 

	getInitialState: function() {
		return {
			items: {}
		}
	},

	componentDidMount: function() {

		var localStorageRef = localStorage.getItem(this.props.title);

		if ( localStorageRef ) {
			this.setState({
				items: JSON.parse(localStorageRef)
			});
		}

	},

	componentWillUpdate: function(nextProps, nextState) {
		localStorage.setItem(this.props.title, JSON.stringify(nextState.items));
	},

	componentDidUpdate: function() {
		this.props.updatePackeryLayout();
	},

	renderItem: function(key) {
		var item = this.state.items[key];
		return (
			<Item key={key} type={item.type} title={item.title} version={item.version} checked={item.checked} checkItem={this.checkItem.bind(null, key)} changeItemType={this.changeItemType.bind(null, key)} changeItemVersion={this.changeItemVersion.bind(null, key)} />
		)
	},

	sortItemsType: function(a, b) {
		if ( this.state.items[b].type == 'bug' ) {
			return 1;
		} 
		if (this.state.items[a].type == 'feature' ) {
			return 1;
		} else {
			return 0;
		}
	},

	sortItemsChecked: function(a, b) {
		if ( this.state.items[a].checked ) {
			return 1;
		} else {
			return 0;
		}
	},

	sortItemsVersion: function(a, b) {
		return parseFloat(this.state.items[a].version) - parseFloat(this.state.items[b].version);
	},

	checkItem: function(key) {

		var item = this.state.items[key];
		item.checked = item.checked ? false : true;
		this.setState({ items: this.state.items });
		console.log('check item');

	},

	changeItemType: function(key, type) {
		var item = this.state.items[key];
		item.type = type;
		this.setState({ items: this.state.items });
	},

	changeItemVersion: function(key, version) {
		var item = this.state.items[key];
		item.version = version;
		this.setState({ items: this.state.items });
	},

	createItem: function(e) {

		// Creates an item the triggers the addItem

		e.preventDefault();

		if ( this.refs.title.value == '' ) {
			alert('Please give this task a title!');
			return false;
		}

		var item = {
			title: this.refs.title.value,
			type: e.target.elements.type.value,
			version: this.refs.version.value || '1.0',
			checked: false
		}

		this.state.items['item-' + (new Date()).getTime()] = item;
		this.setState({ items: this.state.items });

		this.refs.itemForm.reset();

	},

	toggleCheckedItems: function() {
		var itemsHolder = this.refs.itemsHolder;
		if ( itemsHolder.className === 'show-checked' ) {
			itemsHolder.className = 'hide-checked';
		} else {
			itemsHolder.className = 'show-checked';
		}
		this.props.updatePackeryLayout();
	},

	//

	render: function() {

		var items = Object.keys(this.state.items);
		var toggleCheckedButton;

		if ( items.length > 0 ) {
			items = items.sort(this.sortItemsType).sort(this.sortItemsVersion).sort(this.sortItemsChecked).map(this.renderItem);
			toggleCheckedButton = <button onClick={this.toggleCheckedItems} className="toggle-checked">{items.length} Completed tasks</button>
		} else {
			items = <li className="item blank"><h3>This list has no items!</h3></li>
		}

		return (
			<div className="list">

				<h2>
					{ this.props.title }
					<button onClick={this.props.removeList} className="circleButton cross">x</button>
				</h2>

				<div>
					<ul ref="itemsHolder" className="hide-checked">
						{items}
					</ul>
					{toggleCheckedButton}
				</div>

				<form className="item-form" ref="itemForm" onSubmit={this.createItem}>

					<input ref="title" type="text" placeholder="Write your task here..." />

					<label>
						<input type="radio" name="type" value="bug" defaultChecked />
						<span className="bug">B</span>
					</label>

					<label>
						<input type="radio" name="type" value="improvement" />
						<span className="improvement">I</span>
					</label>

					<label>
						<input type="radio" name="type" value="feature" />
						<span className="feature">N</span>
					</label>

					<input ref="version" type="text" className="version" placeholder="1.0" />

					<button type="submit" className="circleButton plus">+</button>

				</form>

			</div>
		);
	}

});

// Item

var Item = React.createClass({

	getDefaultProps: function() {
		return {
			version: '1.0'
		}
	},

	setNewItemType: function() {
		this.props.changeItemType(this.refs.newItemType.value);
	},

	setNewItemVersion: function() {
		var version = this.refs.newItemVersion.value
		if ( version !== '' && ! isNaN(parseFloat(version)) ) {
			this.props.changeItemVersion(this.refs.newItemVersion.value);
		}
		this.refs.newItemVersion.value = '';
		this.toggleInput();
	},

	toggleInput: function() {
		if ( this.refs.newItemVersion.className !== 'visible' ) {
			this.refs.newItemVersion.className = 'visible';
		} else {
			this.refs.newItemVersion.className = '';
		}
	},

	formatVersion: function(v) {
		if ( v % 1 === 0 && v != '1.0') {
			return v + '.0';
		} else {
			return v;
		}
	},

	render: function() {
		var checked = this.props.checked ? 'checked' : '';
		return (

			<li className="item" data-checked={this.props.checked}>

				<h3><Linkify properties={{target: '_blank'}}>{this.props.title}</Linkify></h3>

				<span className="meta">

					<span className="type" data-type={this.props.type}>
						<span className="select-over">{this.props.type}</span>
						<select ref="newItemType" onChange={this.setNewItemType} value={this.props.type}>
							<option value="bug">Bug</option>
							<option value="improvement">Improvement</option>
							<option value="feature">New Feature</option>
						</select>
					</span>

					<span className="version">
						<span className="input-over">{this.formatVersion.call(null, this.props.version)}</span>
						<input type="text" ref="newItemVersion" placeholder={this.props.version} onBlur={this.setNewItemVersion} onClick={this.toggleInput} />
					</span>

				</span>

				<input type="checkbox" className="check" onChange={this.props.checkItem} checked={checked} />

			</li>

		);
	}

});

// Render

ReactDOM.render(<App />, document.getElementById('main'));