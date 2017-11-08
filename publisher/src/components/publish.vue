<template>
	<div id="publish">
	<div class="container-fluid">	
		<div class="row clearfix">
			<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
				<h1>Índice <button class="wipe" v-on:click="wipe()">Apagar TUDO!</button></h1> 
				<template v-for="(item, index) in publishings">
					<div class="item">
						<span>{{item.tag}}</span>
						<img v-bind:src="item.image" />
						<span>{{item.link}}</span>
						<span>{{item.text}}</span>
					</div>
				</template>
			</div>	
			<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
				<h2>Tag</h2>
				<input v-model="tag" name="tag">
				<h2>Imagem</h2>
				<input v-model="image" type="url" name="image" />
				<h2>Link</h2>
				<input v-model="link" type="url" name="url">
				<h2>Resumo (ultimos acontecimentos)</h2>
				<textarea v-model="text"></textarea>
				<button v-on:click="setLocalStorage()" id="publish">Publicar</button>
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
				json: {},
				publishings: []
			}
		},
		mounted: function(){
			this.publishings = getLocalStorage()
		},
		methods: {
			setLocalStorage: function(){
				let storedPublishings = JSON.parse(this.getLocalStorage()) || []
				this.publishings = storedPublishings.concat(this.json)
				localStorage.setItem("publishings", JSON.stringify(this.publishings))
			},
			getLocalStorage: function(){
				return localStorage.getItem("publishings")
			},
			wipe: function() {
				let wipe = confirm("Tem certeza que quer apagar TUDO?");
				if(wipe){
					localStorage.removeItem("publishings")
				}
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
		width: 100%;
	}
	.wipe {
		font-size: 13px;
	}
</style>