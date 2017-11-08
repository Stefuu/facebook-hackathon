<template>
	<div id="publish">
	<div class="container-fluid">	
		<div class="row clearfix">
			<div class="col-lg-4 col-md-4 col-sm-4 col-xs-4">
				<h1>Publicações <button class="wipe" v-on:click="wipe()">Apagar TUDO!</button></h1> 
				<template v-for="(item, index) in publishings">
					<div class="item">
						<div class="center col-lg-12 col-md-12 col-sm-12 col-xs-12">
							<span>Tag: {{item.tag}}</span>
						</div>
						<div class="center col-lg-12 col-md-12 col-sm-12 col-xs-12">
							<img v-bind:src="item.image" />
						</div>	
						<div class="center col-lg-12 col-md-12 col-sm-12 col-xs-12">
							<span>{{item.text}}</span>
						</div>
						<div class="center col-lg-12 col-md-12 col-sm-12 col-xs-12">
							<span><a href="item.link">{{item.link}}</a></span>
						</div	>
					</div>
				</template>
			</div>	
			<div class="col-lg-8 col-md-8 col-sm-8 col-xs-8">
				<h2>Tag</h2>
				<input v-model="tag" name="tag">
				<h2>Imagem</h2>
				<input v-model="image" type="url" name="image" />
				<h2>Link</h2>
				<input v-model="link" type="url" name="url">
				<h2>Resumo (ultimos acontecimentos)</h2>
				<textarea v-model="text"></textarea>
				<button v-on:click="publish()" id="publish">Publicar</button>
			</div>
		</div>
	</div>
	
	</div>
</template>
 
<script>
	export default {
		data () {
			return {
				image: '',
				link: '',
				text: '',
				tag: '',
				json: {},
				publishings: []
			}
		},
		mounted: function(){
			this.publishings = this.getLocalStorage()
		},
		methods: {
			publish: function(){
				if(this.validateFields()){
					this.setLocalStorage()
					this.post()
				}else{
					alert('Campos inválidos')
				}
			},
			post: function(){
				var request = new XMLHttpRequest();
				request.open('POST', 'https://facebook-hackathon-uol.herokuapp.com/send', true);

				request.onload = function() {
				  if (request.status >= 200 && request.status < 400) {
				    console.log('Ajax OK')
				  } else {
				    console.log('Ajax ERR')
				  }
				}

				request.send(JSON.stringify(this.json));
			},
			setLocalStorage: function(){
				let storedPublishings = this.getLocalStorage() || []
				this.publishings = this.jsonClone(storedPublishings.concat(this.json))
				localStorage.setItem("publishings", JSON.stringify(this.publishings))
			},
			getLocalStorage: function(){
				try{
					return JSON.parse(localStorage.getItem("publishings"))
				}catch(err){
					console.log(err)
					return []
				}	
			},
			jsonClone: function(json){
				return JSON.parse(JSON.stringify(json))
			},
			wipe: function() {
				let wipe = confirm("Tem certeza que quer apagar TUDO?")
				if(wipe){
					localStorage.removeItem("publishings")
					this.publishings = []
				}
			},
			validateFields: function(){
				return  (this.json.link && this.json.link.match(/(http|https):\/\//) &&
						this.json.tag && this.json.text)
			}
		},
		watch: {
			image: function(val){
				this.json.image = val
			},
			link: function(val){
				this.json.link = val
			},
			text: function(val){
				this.json.text = val
			},
			tag: function(val){
				this.json.tag = val
			}
		}
	}
</script>

<style scoped>
	textarea {
		width: 100%;
		height: 300px; 
	}
	input {
		width: 100%;
		margin-bottom: 15px;
	}
	.item {
		border: 1px solid;
	}
	img {
		width: 80px;
	}
	.wipe {
		font-size: 13px;
	}
	.center {
		text-align: center;
	}
</style>