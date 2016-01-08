$(function(){

  //--------------------
  // MODEL
  //--------------------
  var app = {};
  app.Todo = Backbone.Model.extend({
    defaults: {
      title: '',
      completed: false
    }
  });

  //--------------------
  //COLLECTION
  //--------------------

  app.TodoList = Backbone.Collection.extend({
    model: app.Todo,
    localStorage: new Store("backbone-todo")
  });

  //new collection instance
  app.todoList = new app.TodoList();

  //--------------------
  //VIEW for Item Listing
  //includes Edit, Remove
  //--------------------

  app.ToDoView = Backbone.View.extend({
    // element that content will be rendered on HTML
    tagName: 'li',
    //call on the template set on html script tags
    template: _.template($('#itemListing').html()),
    //renders to the DOM, pushing content to page
    render: function(){
      this.$el.html(this.template(this.model.toJSON()));
      //gets the change for the edit
      this.input = this.$('.edit');
      return this;
    },
    initialize: function(){
        this.model.on('convert', this.render, this);
        this.model.on('remove', this.remove, this);
    },
    events: {
      //editbox appears when double click
      'dblclick label' : 'edit',
      //enter key changes the item listing to new listing
      'keypress .edit' : 'onEnterUpdate',
      //blue away click will close edit box
      'blur .edit' : 'close',
      //change task to completed
      'click .toggle': 'complete',
      //removes item
      'click .remove': 'remove'
    },
    edit: function(){
      this.$el.addClass('editing');
      this.input.focus();
    },
    close: function(){
      //grabs value for new edit
      var value = this.input.val().trim();
      if(value) {
        //changes value and save to model
        this.model.save({title: value});
      }
      //revert back to normal view
      this.$el.removeClass('editing');
    },
    onEnterUpdate: function(e){
      if(e.which == 13){
        this.close();
      }
    },
    complete: function(){
      //if checked changed status completed
      if(this.$('.toggle').is(":checked")){
        this.model.save({completed: true})
        //change status of pending
        $('#pending').html(parseInt($('#pending').text())-1)
      } else {
        this.model.save({completed: false})
        //change status of pending
        $('#pending').html(parseInt($('#pending').text())+1)
      }
    },
    remove: function(){
      this.model.destroy();
      location.reload();
    }
  });


  //--------------------
  //VIEW for Application
  //--------------------

  app.AppView = Backbone.View.extend({
    el: '#toDoApplication',
    initialize: function () {
      //declares input as the you item
      this.input = this.$('#newItem');
      //add and reset events that can be triggered
      app.todoList.on('add', this.addsOne, this);
      app.todoList.on('reset', this.addsAll, this);
      //fetch grabs the list from the local storage
      app.todoList.fetch();
      this.count();
    },
    events: {
      'keypress #newItem': 'createTodoOnEnter',
      'click #submit': 'createTodoOnClick',
      'click .allComplete': 'checkAll'
    },
    count: function(){
      var count = 0;
      this.$('#pending').html('');
      app.todoList.each(function(each){
        if(each.get('completed') == false){
          count = count + 1
        }
      });
      this.$('#pending').html(count);
    },
    createTodoOnEnter: function(e){
      //13 is enter key
      if ( e.which !== 13 || !this.input.val().trim() ) {
        return;
      }
      app.todoList.create(this.newAttributes());
      this.input.val(''); // clean input box
    },
    createTodoOnClick: function(e){
      //check for empty input
      if (this.input.val() != ''){
        app.todoList.create(this.newAttributes());
        this.input.val('');
      }
    },
    addsOne: function(todo){
      //grabs collection
      var view = new app.ToDoView({model: todo});
      //adds the new list to DOM
      $('#toDoListing').append(view.render().el);
      this.count();
    },
    addsAll: function(){
      //resets the to do list with empty
      this.$('#toDoListing').html('');
      app.todoList.each(this.addsOne, this);
    },
    newAttributes: function(){
      return {
        //grabs values of input and trims out whitespace
        title: this.input.val().trim(),
        //declares value to be false
        completed: false
      }
    },
    checkAll: function(){
      app.todoList.each(function(each){
        each.save({completed: true})
        console.log(each.get('completed'))
        location.reload();
      })


    }
  });

  //initializing the View
  app.appView = new app.AppView([]);


  //--------------------
  //ROUTER
  //--------------------
  // app.Router = Backbone.Router.extend({
  //   routes: {
  //     '*filter' : 'setFilter'
  //   },
  //   setFilter: function(params) {
  //     //setting up filters to be used
  //     window.filter = params || '';
  //     app.todoList.trigger('reset');
  //   }
  // });
  //
  // app.router = new app.Router();
  // Backbone.history.start();


});
