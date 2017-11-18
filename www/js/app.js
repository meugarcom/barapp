// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('BarApp', ['ionic','firebase']);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})


app.config(function($stateProvider, $urlRouterProvider){
  $stateProvider.state('login', {
    url: '/login',
    templateUrl: '/templates/login.html',
    controller: 'LoginCtrl'
  });

  $stateProvider.state('menu', {
    abstract: true,
    url: '/menu',
    templateUrl: '/templates/menu.html',
    controller: 'AuthCtrl'
  });

  $stateProvider.state('registro', {
    url: '/registro',
    templateUrl: 'templates/registro.html',
    controller: 'RegistroCtrl'
  });

  
  $stateProvider.state('menu.listaProdutos',{
    url: '/listaProdutos',
    views: {
      "conteudo":{       
        templateUrl: '/templates/listaProdutos.html',
        controller: 'listaProdutosCtrl'
      }
    }

  });

  $stateProvider.state('menu.Mesa',{
    url: '/mesa',
    views: {
      "conteudo":{  
        templateUrl: '/templates/mesa.html',
        controller: 'mesaCtrl'
      }
    }
  });

  $stateProvider.state('menu.cadastroProdutos',{
    url: '/cadastroProdutos',
    views: {
      "conteudo":{  
      templateUrl: '/templates/cadastroProdutos.html',
      controller: 'cadastroProdutosCtrl'
      }
    }

  });

  

  // INDICAR A TELA INICIAL DO APLICATIVO
  $urlRouterProvider.otherwise('/login');

});




app.controller('IndexCtrl', function($scope, $ionicSideMenuDelegate, BarService){
  $scope.showMenu = function () {
    $ionicSideMenuDelegate.toggleRight();
  };  
//--------------------Cadastro de produtos---------------------
// Dados do produto
  var item = {
    descricao:'',
    estoque:'',
    preco: '',
    imagem:"''"
  } 
  var pessoa = {
    email:'',
    nome:'',
    telefone:''
  }
  //Criando item usando a função do BarService
  BarService.create(item);
  //Lendo o produto criado utilizando a função no BarService
  //$scope.produtos = BarService.read();

//--------------------Fim cadastro produtos-------------------
});




app.controller('LoginCtrl', function($scope, $state, $firebaseAuth, $ionicPopup){
  
  $firebaseAuth().$onAuthStateChanged(function(firebaseUser){
    if(firebaseUser){
      $state.go('menu.listaProdutos');
      var idUsuario = firebaseUser.uid;
    }
  })

 // Logar no sistema
  $scope.user = {}
  $scope.entrar = function(user) {

    $firebaseAuth().$signInWithEmailAndPassword(user.email, user.password)
    .then(function(firebaseUser){
      //efetuou o login com sucesso automaticamente vai para tela de lita de produtos
      $state.go('menu.listaProdutos');
    })
    .catch(function(error){
      //ocorreu um erro no login
       $ionicPopUp.alert({title:'', message:''})
       alert(error.message);

      $ionicPopup.alert({
        title: 'Falha no login',
        template: error.message
      });
    })
  }

});

app.controller('RegistroCtrl', function($scope, $state, $firebaseAuth, $firebaseObject, $ionicPopup){

  $scope.user = {};
  
  $scope.registrar = function(user) {

    $firebaseAuth().$createUserWithEmailAndPassword(user.email, user.password)
    .then(function(firebaseUser){
      //efetuou o registro com sucesso

      var ref = firebase.database().ref("Pessoa").child(firebaseUser.uid);
      $firebaseObject(ref).$loaded(function(pessoa) {
        pessoa.nome = user.nome;
        pessoa.email = user.email;
        pessoa.cpf = user.cpf;
        pessoa.telefone = user.telefone;
        pessoa.tipo = 'cliente';

        pessoa.$save().then(function() {
          $state.go('login');
        })
      })

     
    })
    .catch(function(error){
      //ocorreu um erro no registro
      // $ionicPopUp.alert({title:'', message:''})
      //alert(error.message);

      $ionicPopup.alert({
        title: 'Falha no login',
        template: error.message
      });
    })
  }

});



app.controller('listaProdutosCtrl', function($scope, $firebaseArray, $state){ // Lista = Antigo TipodeprodutoCtrl
 //É necessário criar um novo Scope para trazer os dados dos produtos existente e
 //que foram incluídos através do $scope.produto
 var ref = firebase.database().ref().child('Produtos');
  $scope.produtos = $firebaseArray(ref);
  
  $scope.excluir = function(id){
    var obj = $scope.produtos.$getRecord(id);
    $scope.produtos.$remove(obj);
  }

});

app.controller('mesaCtrl', function($scope, $firebaseArray, $state){
  var ref = firebase.database().ref().child('ItensPedido');
  $scope.itenspedidos = $firebaseArray(ref);
});

app.controller('cadastroProdutosCtrl', function($scope, $firebaseArray, $firebaseObject, $state){

  var firebaseUser = firebase.auth().currentUser;
  var ref = firebase.database().ref("Pessoa").child(firebaseUser.uid);
  $firebaseObject(ref).$loaded(function(pessoa) {
    if(pessoa.tipo == 'cliente') {
      $state.go('menu.listaProdutos');
    }
  })

  $scope.produto = {}; //Contato contato = new Contato();

  $scope.add = function(produto){
    var ref = firebase.database().ref().child('Produtos');
    $firebaseArray(ref).$add(produto);

    $state.go('menu.listaProdutos');
  }
  
 
});

app.controller("AuthCtrl", function($scope, $firebaseObject, $firebaseAuth, $state, $ionicPopup) {

  //----Verifica o usuário atual logado
  var firebaseUser = firebase.auth().currentUser; 
  var ref = firebase.database().ref("Pessoa").child(firebaseUser.uid);
  $scope.usuario = $firebaseObject(ref);
  //------  

  //------ Função de deslogar

     $scope.user = {};
     $scope.sair = function(user) {
      $firebaseAuth().$signOut()
      .then(function(firebaseUser){
        //efetuou o login com sucesso
        $state.go('login');
      })
      .catch(function(error){
        //ocorreu um erro no login
        // $ionicPopUp.alert({title:'', message:''})
        //alert(error.message);

        $ionicPopup.alert({
          title: 'Falha no login',
          template: error.message
        });
      })
    }
})


app.factory('BarService', function() {

  var lista = []; // Banco de dados (volátil/temporário)
  
  return {

    read: function(){
      return lista;
    },

    create: function(objeto) {
      lista.push(objeto);
    }

  }
});
