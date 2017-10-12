/**
 * @author alteredq / http://alteredqualia.com/
 * @modified by Egor Sorokin
 */

THREE.GlitchPass = function ( dt_size ) {
  var self = this;

  THREE.Pass.call( self );

  if ( THREE.DigitalGlitch === undefined ) console.error( "THREE.GlitchPass relies on THREE.DigitalGlitch" );

  var shader = THREE.DigitalGlitch;
  self.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

  if ( dt_size == undefined ) dt_size = 64;


  self.uniforms[ "tDisp" ].value = self.generateHeightmap( dt_size );


  self.material = new THREE.ShaderMaterial( {
    uniforms: self.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader
  } );

  self.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
  self.scene  = new THREE.Scene();

  self.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
  self.quad.frustumCulled = false; // Avoid getting clipped
  self.scene.add( self.quad );

  self.goWild = false;
  self.curF = 0;


  setTimeout(function(){
    self.generateTrigger();
  }, 700);
};

THREE.GlitchPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

  constructor: THREE.GlitchPass,

  render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

    this.uniforms[ "tDiffuse" ].value = readBuffer.texture;
    this.uniforms[ 'seed' ].value = Math.random();//default seeding
    this.uniforms[ 'byp' ].value = 0;

    if ( this.curF % this.randX == 0 || this.goWild == true ) {

      this.uniforms[ 'amount' ].value = Math.random() / 30;
      this.uniforms[ 'angle' ].value = THREE.Math.randFloat( - Math.PI, Math.PI );
      this.uniforms[ 'seed_x' ].value = THREE.Math.randFloat( - 1, 1 );
      this.uniforms[ 'seed_y' ].value = THREE.Math.randFloat( - 1, 1 );
      this.uniforms[ 'distortion_x' ].value = THREE.Math.randFloat( 0, 1 );
      this.uniforms[ 'distortion_y' ].value = THREE.Math.randFloat( 0, 1 );
      this.curF = 0;
      this.generateTrigger();

    } else if ( this.curF % this.randX < this.randX / 5 ) {

      this.uniforms[ 'amount' ].value = Math.random() / 90;
      this.uniforms[ 'angle' ].value = THREE.Math.randFloat( - Math.PI, Math.PI );
      this.uniforms[ 'distortion_x' ].value = THREE.Math.randFloat( 0, 1 );
      this.uniforms[ 'distortion_y' ].value = THREE.Math.randFloat( 0, 1 );
      this.uniforms[ 'seed_x' ].value = THREE.Math.randFloat( - 0.3, 0.3 );
      this.uniforms[ 'seed_y' ].value = THREE.Math.randFloat( - 0.3, 0.3 );

    } else if ( this.goWild == false ) {

      this.uniforms[ 'byp' ].value = 1;

    }

    this.curF ++;
    this.quad.material = this.material;

    if ( this.renderToScreen ) {
      renderer.render( this.scene, this.camera );
    } else {
      renderer.render( this.scene, this.camera, writeBuffer, this.clear );
    }

  },

  generateTrigger: function() {

    this.randX = THREE.Math.randInt( 50, 140 );

  },

  generateHeightmap: function( dt_size ) {

    var data_arr = new Float32Array( dt_size * dt_size * 3 );
    var length = dt_size * dt_size;

    for ( var i = 0; i < length; i ++ ) {

      var val = THREE.Math.randFloat( 0, 1 );
      data_arr[ i * 3 + 0 ] = val;
      data_arr[ i * 3 + 1 ] = val;
      data_arr[ i * 3 + 2 ] = val;

    }

    var texture = new THREE.DataTexture( data_arr, dt_size, dt_size, THREE.RGBFormat, THREE.FloatType );
    texture.needsUpdate = true;
    return texture;

  }

} );
