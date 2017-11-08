<template>
	<div id="publish">
	<div class="container-fluid">	
		<div class="row clearfix">
			<div class="col-lg-9 col-md-9 col-sm-9 col-xs-9">
				<h1>Publicações <button class="wipe" v-on:click="wipe()">Apagar TUDO!</button></h1> 
				<template v-for="(item, index) in publishings">
					<div class="item row" v-bind:class="{ first: index == 0 }">
						<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3">
							<span>Tag: {{item.tag.text}}</span>
						</div>
						<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3">	
							<img v-if="item.image" v-bind:src="item.image" />
							<span v-else="item.image">sem imagem</span>
						</div>
						<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3">	
							<span>{{item.text}}</span>
						</div>
						<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3">
							<span><a href="item.link">{{item.link}}</a></span>
						</div>
					</div>
				</template>
			</div>	
			<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3">
				
				<div class="w3-container w3-gray w3-border">
					<h2 class="white">Postar</h2>
					<input class="w3-input" v-model="tag" name="tag">
					<label>Tag</label>
					
					<input class="w3-input" v-model="image" type="url" name="image" />
					<label>Imagem</label>
					
					<input class="w3-input" v-model="link" type="url" name="url">
					<label>Link</label>
					
					<textarea class="w3-input" v-model="text"></textarea>
					<label>Resumo (ultimos acontecimentos)</label>
					<button class="w3-input" v-on:click="publish()" id="publish">Publicar</button>
				</div>
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
				return  (this.json.link && this.json.link.match(/(http|https):\/\//) && this.json.text)
			},
			toSlug: function(str) {
				return str.toString().toLowerCase()
			    .replace(/\s+/g, '-')
			    .replace(new RegExp(/\s/g),"")
			    .replace(new RegExp(/[àáâãäå]/g),"a")
			    .replace(new RegExp(/æ/g),"ae")
			    .replace(new RegExp(/ç/g),"c")
			    .replace(new RegExp(/[èéêë]/g),"e")
			    .replace(new RegExp(/[ìíîï]/g),"i")
			    .replace(new RegExp(/ñ/g),"n")          
			    .replace(new RegExp(/[òóôõö]/g),"o")
			    .replace(new RegExp(/œ/g),"oe")
			    .replace(new RegExp(/[ùúûü]/g),"u")
			    .replace(new RegExp(/[ýÿ]/g),"y")
			    .replace(/\-\-+/g, '-')
			    .replace(/^-+/, '')
			    .replace(/-+$/, '')
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
				if(val){
					this.json.tag = {
						id: this.toSlug(val),
						text: val
					}
				}
			}
		}
	}
</script>

<style scoped>
	textarea {
		width: 100%;
		height: 100px; 
	}
	input, textarea {
		margin-top: 15px;
	}
	label {

	}
	button {
		border: 1px solid #666;
		margin-top: 25px;
		cursor: pointer;
	}
	.item {
		border-bottom: 1px solid;
		border-left: 1px solid;
		border-right: 1px solid;
		min-height: 80px;
		background-color: #eee;
	}
	.item.first {
		border-top: 1px solid;
	}
	img {
		height: 80px;
	}
	.wipe {
		font-size: 13px;
	}
	.center {
		text-align: center;
	}
	.white {
		color: white;
	}
	.w3-container {
		margin-top: 5px; 
		padding-bottom: 5px;
	}
	.items-container {
		border: 1px solid;
	}
	div {
		word-wrap: break-word;
	}
	a {
		cursor: pointer;
		text-decoration: underline;
		color: blue;
	}
</style>