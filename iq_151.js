import * as THREE from 'three';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { STLExporter } from 'three/addons/exporters/STLExporter.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

var sandbox = document.getElementById('sandbox');
class GlobalErrorSystem {
    constructor() {
        this.errors = new Map(); // Store errors by unique ID
        this.container = null;
        this.initialized = false;
        this.init();
     
    }

    init() {
        if (this.initialized) return;
        
        // Create the error container HTML structure
        this.createErrorContainer();
        this.initialized = true;
    }

    createErrorContainer() {
        // Create the main error container
        const errorContainer = document.createElement('div');
        errorContainer.id = 'global-error-container';
        errorContainer.className = 'error-container hidden';
        
        errorContainer.innerHTML = `
            <div class="error-list" id="error-list">
                <!-- Error messages will be dynamically added here -->
            </div>
        `;

        
        
        // Insert the container into the page (adjust selector as needed)
        const targetParent = document.getElementById('error-parent'); // or wherever you want to place it
        targetParent.appendChild(errorContainer);
        
        this.container = errorContainer;
    }
// Add a new error
    addError(id, title, description, buttonConfig = null, highlight = null) {
        // Check if error already exists - if so, don't add duplicate
        if (this.errors.has(id)) {
            //$('.'+id).not(':first').remove();
            console.log(this.errors)
            return id;
        }

        const errorElement = document.createElement('div');
        errorElement.className = 'error-item ' + id;
        errorElement.dataset.errorId = id;
        
        let buttonHTML = '';
        if (buttonConfig) {
        buttonHTML = `<button class="error-button" data-error-id="${id}">${buttonConfig.text}</button>`;
        }
        let highlightElement = null;
        if(highlight) {
          $(highlight).addClass('error');
          highlightElement = highlight;
        }

        errorElement.innerHTML = `
            <div class="error-header">
                <div class="error-icon"></div>
                <div class="error-title">${title}</div>
            </div>
            <div class="error-content">
                <p>${description}</p>
                ${buttonHTML}
            </div>
        `;
      // Store in our errors map
        this.errors.set(id, {
            element: errorElement,
            title: title,
            description: description,
            buttonConfig: buttonConfig,
            expanded: false,
            highlight: highlightElement
        });
        // Add click handler for expand/collapse
        errorElement.addEventListener('click', (e) => {
            // Don't toggle if a button was clicked
            if (e.target.classList.contains('error-button')) {
                e.stopPropagation();
                this.handleButtonClick(id, buttonConfig);
                return;
            }
            this.toggleError(id);
        });

        // Add to the list (new errors go to the bottom)
        const errorList = document.getElementById('error-list');
        errorList.appendChild(errorElement);

        


        // Show container if it was hidden
        this.showContainer();

        // Remove the 'new' class after animation
        

        return id;
    }
    handleButtonClick(errorId, buttonConfig) {
        if (buttonConfig && typeof buttonConfig.onClick === 'function') {
            buttonConfig.onClick(errorId);
        }
    }
    // Remove an error
removeError(id) {
    const error = this.errors.get(id);
    if (!error) return false;

    const errorElement = error.element;
    const highlightElement = error.highlight;
    
    if(highlightElement) {
        $(highlightElement).removeClass('error');
    }

    // Remove from DOM - but also check for any duplicates
    if (errorElement && errorElement.parentNode) {
        errorElement.parentNode.removeChild(errorElement);
    }
    
    // Also remove any duplicate elements with the same class (failsafe)
    $('.' + id).remove();
    
    this.errors.delete(id);

    // Hide container if no errors remain
    if (this.errors.size === 0) {
        this.hideContainer();
    }

    return true;
}

    // Toggle error expansion
    toggleError(id) {
        const error = this.errors.get(id);
        if (!error) return;

        error.expanded = !error.expanded;
        
        if (error.expanded) {
            error.element.classList.add('expanded');
        } else {
            error.element.classList.remove('expanded');
        }
    }

    // Clear all errors
    clearAllErrors() {
        Array.from(this.errors.keys()).forEach(id => {
            this.removeError(id);
        });
    }

    // Show the error container
    showContainer() {
        if (this.container) {
            this.container.classList.remove('hidden');
        }
    }

    // Hide the error container
    hideContainer() {
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }

    // Check if an error exists
    hasError(id) {
        return this.errors.has(id);
    }

    // Get error count
    getErrorCount() {
        return this.errors.size;
    }

    // Update an existing error
    updateError(id, title, description) {
        const error = this.errors.get(id);
        if (!error) {
            // If error doesn't exist, create it
            return this.addError(id, title, description);
        }

        // Update the content
        const titleElement = error.element.querySelector('.error-title');
        const contentElement = error.element.querySelector('.error-content p');
        
        if (titleElement) titleElement.textContent = title;
        if (contentElement) contentElement.textContent = description;

        // Update stored data
        error.title = title;
        error.description = description;

        return id;
    }
}
// Create global instance
const globalErrorSystem = new GlobalErrorSystem();

// Global convenience functions
function addError(id, title, description, buttonConfig = null, highlight = null) {
    return globalErrorSystem.addError(id, title, description, buttonConfig, highlight);
}

function removeError(id) {
    return globalErrorSystem.removeError(id);
}

function updateError(id, title, description) {
    return globalErrorSystem.updateError(id, title, description);
}

function clearAllErrors() {
    return globalErrorSystem.clearAllErrors();
}

function hasError(id) {
    return globalErrorSystem.hasError(id);
}

function getErrorCount() {
    return globalErrorSystem.getErrorCount();
}


//END ERROR HANDLING

let exporter;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(60, sandbox.offsetWidth / sandbox.offsetHeight, .1, 1000);
camera.position.set(-3, 5, 20).setLength(5);
let orthoCamera = new THREE.OrthographicCamera(sandbox.offsetWidth/-2, sandbox.offsetWidth/2, sandbox.offsetHeight/2, sandbox.offsetHeight/-2, 1,1000);
orthoCamera.position.set(-3,5,20).setLength(.75);
orthoCamera.lookAt(new THREE.Vector3(0,0,0));
scene.add(orthoCamera);
let renderer = new THREE.WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true
});
exporter = new STLExporter();
renderer.shadowMap.enabled = true;
renderer.setSize(sandbox.offsetWidth, sandbox.offsetHeight);
renderer.setClearColor(0xffffff, 0);
sandbox.appendChild(renderer.domElement);
window.addEventListener("resize", event => {
  camera.aspect = sandbox.offsetWidth / sandbox.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(sandbox.offsetWidth, sandbox.offsetHeight);
})

let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = .5;
controls.maxDistance = 100;
let light = new THREE.DirectionalLight(0xffffff, 2);
let light2 = new THREE.DirectionalLight(0xffffff, 1);
const amb = new THREE.AmbientLight( 0x404040 ); 
//scene.add( amb );
light2.position.setScalar(-1);
light.position.setScalar(1);
light.castShadow = true;
scene.add(light2);
scene.add(light, new THREE.AmbientLight(0xffffff, 2));
const gui = new GUI();
var params = {
      ID: 0.06,
      OD: 0.12,
      tip_ID_Len: 0.1,
      angle: 3,
      Length: 1,
      tip_ID: 0.035,
      radius: 0.005,
      takeScreenshot: takeScreenshot,
      exportBinary: exportBinary,
      modelColor: "#ffffff",
      opacity: .85,
      rotation: true,
      sphereColor: "#333"
}

const folder = gui.addFolder( 'Export' );
const idController = folder.add(params, 'ID', 0.07, .5, .001).onChange( createShape );
const odController = folder.add(params, 'OD', 0.075, .5, .001).onChange( createShape );
const angleController = folder.add(params, 'angle', 2, 15, .5).onChange( createShape );
const lengthController = folder.add(params, 'Length', 0, 100, .2).onChange( createShape );
const tipController = folder.add(params, 'tip_ID', {0.014:0.014, 0.018:0.018, 0.022:0.022, 0.035:0.035}).onChange(createShape);
const radiusController = folder.add(params, 'radius', 0, 0.03, .001).onChange( createShape );
const materialController = folder.add(params, 'modelColor', ['#ffffff','#000000','#97999B','#00AB8E','#006A52', '#004B87', '#002855', '#9678D3']).onChange( createShape );
const opacityController = folder.add(params, 'opacity', 0.1, 1, 0.6).onChange ( createShape );
const sphereController = folder.add(params, 'sphereColor', ['#333', '#e0e0e0']).onChange( createSphere );
sphereController.hide();
opacityController.hide();
materialController.hide();
angleController.hide();
lengthController.hide();
tipController.hide();
radiusController.hide();
idController.hide();
odController.hide();
const imageController = folder.add( params, 'takeScreenshot').name('Save as Image');
const stlController = folder.add( params, 'exportBinary').name('Save as STL');
const rotationController = folder.add( params, 'rotation' ).name('Rotate').onChange( createShape );
folder.open();

function createSphere() {
const spheregeometry = new THREE.SphereGeometry( 100, 32, 16 );
const material = new THREE.MeshStandardMaterial({color: params.sphereColor, roughness: .8});
const sphere = new THREE.Mesh( spheregeometry, material ); 
sphere.material.side = THREE.BackSide;
sphere.receiveShadow = true;

const bg = new THREE.Object3D();

bg.name = "bg";
bg.add(sphere);
scene.add(bg);
console.log('i have been loaded');
}
createSphere();
let rotate = 0.005;
function createShape(){

if ($("#unit").val() == 'in'){var tol = 0.002; var conversionFactor = 1;}else{var tol= 0.05; var conversionFactor = 25.4}
// ADJUST ID / OD IF NEGATIVE
// if((Number(params.OD) - Number(params.ID)) < 0) {
//   var od = Number(params.ID) + Number(tol);
//   //this.setValue(od);
// } else {
//   var od = Number(params.OD);
// }
// if((params.ID - params.OD) > 0) {
//   var id = Number(params.OD) - Number(tol);
//   //this.setValue(id);
// } else {
//   var id = Number(params.ID);
// }

var id = params.ID ;
var od = params.OD;
var tipID = Number((params.tip_ID * conversionFactor).toFixed(3));
// if(od - id < (od * 0.4)) {
//   od = Number(id) + (od * 0.4)
//   odController.setValue(Number(id)+(od * 0.4))
// }
//KEEP ID FROM BEING SMALLER THAN TIP ID
if (id <= tipID) {
  id = tipID
  
}
var radius = params.radius;
if (tipID+params.radius >= od) {
  radius = Number(od) - tipID;
}
  

if(params.rotation == true) { rotate = 0.005;} else {rotate = 0;};

let curve = new THREE.Shape()
curve.absarc(tipID, 0, radius, 0, Math.PI/2 );
var points = curve.getSpacedPoints( 20 );
const tipRad = new THREE.LatheGeometry( points, 64 );

  
var toRad = params.angle * Math.PI / 180;
var otherAngle = (Math.PI/2) - toRad;
var taperLength = (od-tipID)/2 * Math.tan(otherAngle);
$("#taper-length").text(taperLength.toFixed(3));
$("#tip-id-len, #tip-id-len-range").attr('max', taperLength.toFixed(3));
let outerTaper = new THREE.CylinderGeometry( tipID+radius, od, taperLength-(radius), 64, 15, true );
let innerTaper = new THREE.CylinderGeometry( tipID, id, taperLength - params.tip_ID_Len, 64, 15, true );
let idLength = new THREE.CylinderGeometry( tipID, tipID, params.tip_ID_Len, 64, 15, true );
let outer = new THREE.CylinderGeometry( od, od, params.Length, 64, 15, true );
let inner = new THREE.CylinderGeometry( id, id, params.Length, 64, 15, true );
let m = new THREE.MeshStandardMaterial({color: params.modelColor, depthWrite: false, roughness: .1,transparent: true,opacity: .5});
  m.side = THREE.BackSide;
m.side = THREE.DoubleSide;
var previous = scene.getObjectByName( "obj" );
if (previous != "") {
  
scene.remove(previous);

            }

let tipRadius = new THREE.Mesh(tipRad, m)
let o = new THREE.Mesh(outer, m);
let oTap = new THREE.Mesh(outerTaper, m);
let i = new THREE.Mesh(inner, m);
let iTap = new THREE.Mesh(innerTaper, m);
let iLen = new THREE.Mesh(idLength, m);
iLen.translateY((params.Length / 2) + (taperLength - (params.tip_ID_Len / 2)));
oTap.translateY((params.Length / 2) + (taperLength/2)-radius/2);
iTap.translateY((params.Length / 2) + ((taperLength-params.tip_ID_Len)/2));
tipRadius.translateY((params.Length / 2) + (taperLength - radius));





o.geometry.center();
o.material.shading = THREE.SmoothShading;

const obj = new THREE.Object3D();


obj.name = "obj";
obj.add(o);
obj.add(oTap);
obj.add(i)
obj.add(iTap)
obj.add(iLen)
obj.add(tipRadius)
obj.translateY(-taperLength/2);
  //ROTATION
//obj.rotation.x = Math.PI;

scene.add(obj);

  
}

createShape(0.05);
let clock = new THREE.Clock();

$(".cost").prop("readonly",true);

var day = dayjs().day();
if (day == 6) {
$("#5-week-date").text(dayjs().add(37, 'day').format('MMMM DD'));
$("#6-week-date").text(dayjs().add(44, 'day').format('MMMM DD'));
$("#8-week-date").text(dayjs().add(58, 'day').format('MMMM DD'));

}
else if (day == 7) {
$("#5-week-date").text(dayjs().add(36, 'day').format('MMMM DD'));
$("#6-week-date").text(dayjs().add(43, 'day').format('MMMM DD'));
$("#8-week-date").text(dayjs().add(57, 'day').format('MMMM DD'));

} else {
$("#5-week-date").text(dayjs().add(35, 'day').format('MMMM DD'));
$("#6-week-date").text(dayjs().add(42, 'day').format('MMMM DD'));
$("#8-week-date").text(dayjs().add(56, 'day').format('MMMM DD'));

}


var user = "";
// setTimeout(function() {
// user = JSON.parse(localStorage.getItem('pocketbase_auth'));
// var reward = user.model.reward;

// if((sessionStorage.getItem("rewards") !== null) && (Number((sessionStorage.getItem("rewards"))) > 0)) { 
//   var storedReward = Number(sessionStorage.getItem("rewards"));
//   var checkReward = Math.min(reward, storedReward);         
//          } else {
//   var checkReward = reward;
//          }
// $("#reward-counter").val(checkReward);
// if(reward > 0) {
//   $("#reward-box").removeClass("hide-price");
//   $("#reward-counter").val(checkReward);
//   $("#expedites-remaining").text(checkReward);
// }
// }, 1500);

$(document).on("change", "#apply-expedite", function(){
  if($(this).is(":checked")) {
    $("#6-week-price").val($("#8-week-price").val());
    $("#6-week").prop('checked', true).trigger('change');
  } else {
    $("#8-week-price").trigger('change');
  }
});


$("#8-week-price").on('change', function(){

if(user.model?.discount) {
  var discount = 1 - Number(user.model.discount);
} else {
  var discount = 1;
}

var startPrice = this.value;
$("#5-week-price").val(((Number(startPrice)+1250)*discount).toFixed(2));
$("#5-week-discount").text('$' + (Number(startPrice)+1250).toFixed(2));
$("#6-week-price").val(((Number(startPrice)+400)*discount).toFixed(2));
$("#6-week-discount").text('$' + (Number(startPrice)+400).toFixed(2));
$("#8-week-price").val(((Number(startPrice)+0)*discount).toFixed(2));
$("#8-week-discount").text('$' + (Number(startPrice)+0).toFixed(2));

});

$(document).ready(function() {

let intervalId;

function attemptAction() {
  // Attempt the action
  const success = doSomething();

  if (success) {
    $("#8-week-price").trigger("change");
    // If successful, clear the interval
    clearInterval(intervalId);
    console.log("Action succeeded!");
  } else {
    console.log("Action failed, retrying...");
  }
}

// Placeholder for the action to be performed
function doSomething() {
  // Replace this with the actual action that needs to be performed
  // Return true for success, false for failure
  // For example:
  var checkUser = localStorage.getItem('pocketbase_auth');
  if(checkUser === null) {
    return false;
  } else {
    user = JSON.parse(localStorage.getItem('pocketbase_auth'));
    if(user.model?.reward) {
     var reward = user.model.reward; 
    } else {
      var reward = 0;
    }
    
    if((sessionStorage.getItem("rewards") !== null) && (Number((sessionStorage.getItem("rewards"))) > 0)) {
    var storedReward = Number(sessionStorage.getItem("rewards"));
    var checkReward = Math.min(reward, storedReward);
    } else {
    var checkReward = reward;
    }
    $("#reward-counter").val(checkReward);
    if(reward > 0) {
    //$("#reward-box").removeClass("hide-price");
    $("#reward-counter").val(checkReward);
    $("#expedites-remaining").text(checkReward);
    }
    
    
    return true;
  }

}
 intervalId = setInterval(attemptAction, 100);
 var browser = $.browser.name +
               " v" + $.browser.versionNumber + 
               " on " + $.browser.platform;
 var message = {
    "system": browser
  }
  //window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
$('#qty-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#qty-popup",
    collision: "none"
  }
  });
$('#shipping-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#shipping-method",
    collision: "none"
  }
  });
$('#account-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#shipping-account",
    collision: "none"
  }
  });
$('#2day-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#2-day-date",
    collision: "none"
  }
  });
$('#verification').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#po-verification",
    collision: "none"
  }
  });
  $('#empty-po').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#po-number",
    collision: "none"
  }
  });
$('#cert-0').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#cert-0-dialog",
    collision: "none"
  }
  });
$('#cert-1').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#cert-1-dialog",
    collision: "none"
  }
  });
$('#cert-2').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#cert-2-dialog",
    collision: "none"
  }
  });
$('#cert-3').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#cert-3-dialog",
    collision: "none"
  }
  });
$('#wall-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#wall",
    collision: "none"
  }
  });
$('#length-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#length",
    collision: "none"
  }
  });
  $('#taper-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#length",
    collision: "none"
  }
  });
  $('#high-tol').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#id-tol-2",
    collision: "none"
  }
  });
  
  $('#ref-dialog').dialog({
    autoOpen : false, modal : true, dialogClass: 'no-close', position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#id-3",
    collision: "none"
  },
  buttons: {
    'Continue Anyway': function() { 
              $("#custom-quote").prop('checked', true);
              $("#custom-quote").trigger('change');
              $(this).dialog("close");
              calculate(true);
    },
    'Go Back': function() { 
              if (['Pebax 45D','Pebax 55D','Pebax 63D', 'Pebax 70D', 'Pebax 72D', 'Pebax 74D', 'Vestamid ML21'].includes($("#material-2").val()) ){
              $("#od-4").prop("checked", true);
              $("#od-4").trigger("change");
              } else {
              $("#id-3").prop("checked", true);
              $("#id-3").trigger("change");
              }
              $(this).dialog("close");
              calculate(false);
    }
  }
  });
});

$(".updater").on('change', function(e, conversion = null) {
  const target = e.target.id.includes('range') ? e.target.id : e.target.id.replace('-range','');
  const pair = e.target.id.includes('range') ? e.target.id.replace('-range','') : e.target.id + '-range';
  
  // Handle range/input synchronization
  if($("#"+e.target.id).hasClass('dim')) {
    var step = Number($("#" + e.target.id).attr('step'));
    if(step.toString().includes('.')) {
      var dec = step.toString().split('.')[1].length;
    } else {
      var dec = step.toString().length;
    }
    var value = (Math.round($("#" + e.target.id).val() / step) * step).toFixed(dec);
    $("#" + e.target.id).val(value);
    $('#'+pair).val(value);
  }
  
  // Handle specific field updates
  updateParams(e.target.id, conversion);
});


$(".updater").on('input', function(e) {
  if($("#"+e.target.id).hasClass('dim')) {
  if (e.target.id.includes('range')) {
    var pair = e.target.id.replace('-range','');
    $("#"+pair).val($("#"+e.target.id).val());
  }
  }
 updateParams(e.target.id);
});

function updateParams(driver, conversion) {
  autoSetTolerances(driver);
  
  // Prevent impossible combinations
  if (conversion) {
    var prevent = true;
  } else {
    var prevent = preventImpossible();
  }
  
  if (prevent) {
  updateWallThicknessLimits();
  $("#inner-diameter").val((Number($("#od").val()) - (Number($("#wall").val())*2)).toFixed(3));
    // Update Three.js parameters
var colorInput = $("#colorant").val();
if(colorInput == '') {var color = '#ffffff' };
if(colorInput == 'White') {var color = '#ffffff' };
if(colorInput == 'Black') {var color = '#000000' };
if(colorInput == 'Cool Grey (7C)') {var color = '#97999B' };
if(colorInput == 'Green (3268C)') {var color = '#00AB8E' };
if(colorInput == 'Green (3298C)') {var color = '#006A52' };
if(colorInput == 'Blue (301C)') {var color = '#004B87' };
if(colorInput == 'Blue (295C)') {var color = '#002855' };
if(colorInput == 'Purple (2655C)') {var color = '#9678D3' };
if(colorInput == 'Cool Grey (4C)') {var color = '#BBBCBC' };
if(colorInput == 'Green (3248C)') {var color = '#6DCDB8' };
if(colorInput == 'Blue (2925C)') {var color = '#009CDE' };
if(colorInput == 'Blue (290C)') {var color = '#B9D9EB' };
if($("#unit").val() == 'in') {var length = 1} else {var length = 25.4};
    params = {
      ID: Number($("#inner-diameter").val()),
      OD: Number($("#od").val()),
      angle: Number($("#taper").val()),
      Length: length,
      tip_ID: Number($("#tip-id").val()),
      tip_ID_Len: Number($("#tip-id-len").val()),
      radius: 0.005,
      takeScreenshot: takeScreenshot,
      exportBinary: exportBinary,
      modelColor: color,
      opacity: .85,
      rotation: $("#rotation").is(':checked'),
      sphereColor: $("#mode").is(":checked") ? "#e0e0e0" : "#333"
    };
    
    createShape(driver);
    calculate();
  }
}
function autoSetTolerances(driver) {
  var unit = $("#unit").val();
  var od = Number($("#od").val());
  var taper = Number($("#taper").val());
  
  // Auto-set tolerances when OD changes and user hasn't manually set them
  if (driver === 'od' || driver === 'od-range') {
    if (unit === 'in') {
      var conversionFactor = 1;
      var step = 0.001;
    } else {
      var step = 0.025;
      var conversionFactor = 25.4;
    }
      if (od < 0.106*conversionFactor) {
        
        $("#od-tol-2").val((Math.round((0.002 * conversionFactor)/step)*step).toFixed(3));
        $("#wall-tol").val((Math.round((0.002 * conversionFactor)/step)*step).toFixed(3));
        if (taper < 3) {
          $("#taper, #taper-range").val(3);
          angleController.setValue(3);
        }
      } else if (od >= (0.107*conversionFactor) && od < (0.183*conversionFactor)) {
        $("#od-tol-2").val((Math.round((0.002 * conversionFactor)/step)*step).toFixed(3));
        $("#wall-tol").val((Math.round((0.002 * conversionFactor)/step)*step).toFixed(3));
        if (taper < 3) {
          $("#taper, #taper-range").val(3);
          angleController.setValue(3);
        }
      } else if (od > (0.183*conversionFactor) && od < (0.262*conversionFactor)) {
        $("#od-tol-2").val((Math.round((0.002 * conversionFactor)/step)*step).toFixed(3));
        $("#wall-tol").val((Math.round((0.002 * conversionFactor)/step)*step).toFixed(3));
        if (taper < 4) {
          $("#taper, #taper-range").val(4);
          angleController.setValue(4);
        }
      } else if (od > (0.262*conversionFactor) && od < (0.340*conversionFactor)) {
        $("#od-tol-2").val((Math.round((0.003 * conversionFactor)/step)*step).toFixed(3));
        $("#wall-tol").val((Math.round((0.003 * conversionFactor)/step)*step).toFixed(3));
        if (taper < 5) {
          $("#taper, #taper-range").val(5);
          angleController.setValue(5);
        }
      } else if (od > 0.340*conversionFactor) {
        $("#od-tol-2").val((Math.round((0.004 * conversionFactor)/step)*step).toFixed(3));
        $("#wall-tol").val((Math.round((0.004 * conversionFactor)/step)*step).toFixed(3));
        if (taper < 5) {
          $("#taper, #taper-range").val(5);
          angleController.setValue(5);
        }
      }
    
    
  }
}

function updateWallThicknessLimits() {
  var od = Number($("#od").val());
  var tipId = Number($("#tip-id").val());
  var wallTol = Number($("#wall-tol").val());
  var unit = $("#unit").val();
  var wsig = (unit === 'in') ? 4 : 3;
  
  // Calculate minimum wall thickness (15% of OD / 2)
  var minWallThickness = ((od * 0.15) / 2);
  $("#wall, #wall-range").attr('min', minWallThickness.toFixed(wsig));
  
  // Calculate maximum wall thickness
  var maxWallThickness = ((od - tipId) / 2) - (wallTol * 2);
  $("#wall, #wall-range").attr("max", maxWallThickness.toFixed(wsig));
  
  // Update wall thickness to be within limits if necessary
  var currentWall = Number($("#wall").val());
  if (currentWall < minWallThickness) {
    $("#wall, #wall-range").val(minWallThickness.toFixed(wsig));
  } else if (currentWall > maxWallThickness) {
    $("#wall, #wall-range").val(maxWallThickness.toFixed(wsig));
  }
  
  // Update the visual range indicator
  updateWallRangeIndicator(od, minWallThickness, maxWallThickness);
}

function updateWallRangeIndicator(od, minWallThickness, maxWallThickness) {
  // Calculate the acceptable range for wall thickness (20% to 70% of OD)
  var minAcceptable = (od * 0.2) / 2 - Number($("#wall-range").attr('min'));
  var maxAcceptable = (od * 0.7) / 2 - Number($("#wall-range").attr('min'));
  var totalRange = Number($("#wall-range").attr('max')) - Number($("#wall-range").attr('min'));
  
  // Adjust maxAcceptable if it exceeds the actual maximum
  if (((od * 0.7) / 2) > Number($("#wall-range").attr("max"))) {
    maxAcceptable = totalRange;
  }
  
  // Calculate percentage positions for the visual indicator
  var leftPercent = (minAcceptable / totalRange) * 100;
  var widthPercent = ((maxAcceptable - minAcceptable) / totalRange) * 100;
  
  // Remove existing indicator
  if ($("#wall-possibility").length) {
    $("#wall-possibility").remove();
  }
  
  // Add new visual range indicator
  $("#wall-slider-container").append(
    `<div id="wall-possibility" style="
      position: absolute;
      border: 2px solid #8ac1c3;
      border-bottom: none;
      border-radius: 5px 5px 0px 0px;
      top: -5px;
      height: 7px;
      width: ${widthPercent}%;
      left: ${leftPercent}%;
    "></div>`
  );
}

function preventImpossible(converting) {
  
  var unit = $("#unit").val();
  
  if (unit == 'in') {
    var tol = 0.002;
    var conversionFactor = 1;
  } else {
    var tol = 0.05;
    var conversionFactor = 25.4;
  }
  var id = Number($("#inner-diameter").val());
  var od = Number($("#od").val());
  var wall = Number($("#wall").val());
  var tipId = Number($("#tip-id").val() * conversionFactor);
  var taperlen = Number($("#taper-length").text());
  var tipIdLen = Number($("#tip-id-len").val());
  if ( tipIdLen > taperlen ) {
    $("#tip-id-len, #tip-id-len-range").val(taperlen - tol);
    return false;
  }
  // Prevent ID from being smaller than tip ID
  if (id <= tipId) {
    $("#inner-diameter, #id-range").val(tipId + tol);
    idController.setValue(tipId + tol);
    return false;
  }
  
  // Prevent OD from being smaller than ID + tolerance
  if (od <= (id + tol)) {
    var newOd = id + tol;
    $("#od, #od-range").val(newOd);
    odController.setValue(newOd);
    return false;
  }
  
  // Prevent wall thickness issues
  var maxWall = (od - tipId) / 2 - (Number($("#wall-tol").val()) * 2);
  if (wall > maxWall) {
    $("#wall, #wall-range").val(maxWall.toFixed(4));
    return false;
  }
  
  var minWall = (od * 0.15) / 2;
  if (wall < minWall) {
    $("#wall, #wall-range").val(minWall.toFixed(4));
    return false;
  }
  
  return true;
}

// Validation functions (similar to balloon project structure)
function checkIdTol(idTol, conversion) {
  if (Number(idTol) > (Number($("#inner-diameter").val()) * 0.2)) {
    addError(
      'id-tol-high',
      'The ID tolerance is too high for an instant quote.',
      'Decrease ID tolerance, or continue with a custom quote',
      null,
      '#id-tol-2'
    );
    return false;
  } else {
    removeError('id-tol-high');
    return true;
  }
}

function checkOdTol(odTol, odTolerance, conversion) {
  if (Number(odTol) > Number(odTolerance)) {
    addError(
      'od-tol-small',
      'The outer diameter tolerance is too small to qualify for an instant quote.',
      'Increase OD tolerance, or continue with a custom quote.',
      null,
      '#od-tol-2'
    );
    return false;
  } else {
    removeError('od-tol-small');
    return true;
  }
}

function checkWallTol(wallTol, wallTolerance) {
  if (Number(wallTol) > Number(wallTolerance)) {
    addError(
      'wall-tol-small',
      'The wall tolerance is too small to qualify for an instant quote.',
      'Increase wall tolerance, or continue with a custom quote.',
      null,
      '#wall-tol'
    );
    return false;
  } else {
    removeError('wall-tol-small');
    return true;
  }
}

function checkTaper(taper, minAngle) {
  if (Number(taper) < minAngle) {
    addError(
      'taper-low',
      'The taper angle is too low to qualify for an instant quote.',
      'Increase taper angle, or continue with a custom quote.',
      null,
      '#taper'
    );
    return false;
  } else {
    removeError('taper-low');
    return true;
  }
}

function checkTaperTol(taperTolerance) {
  if (Number(taperTolerance) < 1) {
    addError(
      'taper-tol-low',
      'The taper tolerance is too low to qualify for an instant quote.',
      'Increase taper tolerance, or continue with a custom quote.',
      null,
      '#taper-tol'
    );
    return false;
  } else {
    removeError('taper-tol-low');
    return true;
  }
}

function checkLengthTol(lengthTol) {
  if (lengthTol.toLowerCase() !== 'min') {
    addError(
      'length-tol-invalid',
      'A "MIN" Length Tolerance is required for an instant quote.',
      'Change length tolerance to "MIN", or continue with a custom quote',
      null,
      '#length-tol-2'
    );
    return false;
  } else {
    removeError('length-tol-invalid');
    return true;
  }
}
function checkIdLength (id, tipIdLen) {
  var bottom = id/2;
  var taperlen = Number($("#taper-length").text());
  var side = taperlen - tipIdLen;
  var angle = Math.atan(side/bottom);
  if( angle < 1.047 ) {
    addError(
      'id-angle',
      'The GWC is too long to qualify for an instant quote.',
      'Decrease GWC, or continue with a custom quote.',
      null,
      '#tip-id-len'
    );
    return false;
  } else {
    removeError('id-angle');
    return true;
  }
  
}
function checkWall(wall, wallMin, wallMax) {
  if (wall < wallMin) {
    addError(
      'wall-too-small',
      'The wall thickness is too small to qualify for an instant quote.',
      'Increase wall thickness, or continue with a custom quote.',
      null,
      '#wall'
    );
    return false;
  } else if (wall > wallMax) {
    removeError('wall-too-small');
    addError(
      'wall-too-large',
      'The wall thickness is too large to qualify for an instant quote.',
      'Decrease wall thickness, or continue with a custom quote.',
      null,
      '#wall'
    );
    return false;
  } else {
    removeError('wall-too-small');
    removeError('wall-too-large');
    return true;
  }
}

function checkOD(od, conversion) {
  var maxOd = ($("#unit").val() == 'in') ? 0.350 : 8.89;
  var minOd = ($("#unit").val() == 'in') ? 0.079 : 2;
  
  if (od > maxOd) {
    addError(
      'od-too-large',
      'The outer diameter is too large to qualify for an instant quote.',
      'Decrease OD, or continue with a custom quote.',
      null,
      '#od'
    );
    return false;
  } else if (od < minOd) {
    removeError('od-too-large');
    addError(
      'od-too-small',
      'The outer diameter is too small to qualify for an instant quote.',
      'Increase outer diameter, or continue with a custom quote.',
      null,
      '#od'
    );
    return false;
  } else {
    removeError('od-too-large');
    removeError('od-too-small');
    return true;
  }
}

function checkLength(length, conversion) {
  var maxLength = ($("#unit").val() == 'in') ? 72 : 1829;
  var minLength = ($("#unit").val() == 'in') ? 12 : 300;
  
  if (length > maxLength) {
    addError(
      'length-too-long',
      'The length is too large to qualify for an instant quote.',
      'Decrease length, or continue with a custom quote.',
      null,
      '#length'
    );
    return false;
  } else if (length < minLength) {
    removeError('length-too-long');
    addError(
      'length-too-short',
      'The length is too small to qualify for an instant quote.',
      'Increase length, or continue with a custom quote.',
      null,
      '#length'
    );
    return false;
  } else {
    removeError('length-too-long');
    removeError('length-too-short');
    return true;
  }
}

function checkQuantity(qty) {
  if (qty > 50) {
    addError(
      'qty-too-high',
      'Your quantity is too high to qualify for an instant quote.',
      'Decrease quantity, or continue with a custom quote.',
      null,
      '#quantity-2'
    );
    return false;
  } else {
    removeError('qty-too-high');
    return true;
  }
}

function checkMaterial() {
  if ($("#material-2").val() == '') {
    addError(
      'material-required',
      'Select a material to qualify for an instant quote.',
      'Please select a material',
      null,
      '#material-2'
    );
    return false;
  } else {
    removeError('material-required');
    return true;
  }
}

function checkTipId() {
  if ($("#tip-id").val() == '') {
    addError(
      'tip-id-required',
      'Select a tip ID to qualify for an instant quote.',
      'Please select a tip ID',
      null,
      '#tip-id'
    );
    return false;
  } else {
    removeError('tip-id-required');
    return true;
  }
}

// Main validation function (replaces the original calculate function)
function calculate() {
  var unit = $("#unit").val();
  var conversion = (unit == 'in') ? 0.03937 : 1;
  var id = Number($("#inner-diameter").val());
  var tipIdLen = Number($("#tip-id-len").val());
  var od = Number($("#od").val());
  var wall = Number($("#wall").val());
  var taper = Number($("#taper").val());
  var taperTolerance = Number($("#taper-tol").val());
  var length = Number($("#length").val());
  var lengthTol = $("#length-tol-2").val();
  var material = $("#material-2").val();
  var qty = Number($("#quantity-2").val());
  var odTolerance = $("#od-tol-2").val();
  var wallTolerance = $("#wall-tol").val();
  var idTol = $("#id-tol-2").val();

  // Determine if material is compliant
  var isCompliant = !['Pebax 63D','Pebax 55D','HDPE', 'LDPE'].includes(material);
  
  // Set pricing based on material and quantity
  if (['Pebax 63D','Pebax 55D','HDPE', 'LDPE'].includes(material)) {
    if (Number(qty) == 10) {
      $("#8-week-price").val(4210);
    } else if (Number(qty) == 25) {
      $("#8-week-price").val(5420);
    } else if (Number(qty) == 50) {
      $("#8-week-price").val(7235);
    }
  }

  // Determine tolerances and limits based on OD ranges
  var wallMin, wallMax, wallTol, odTol, minAngle;
  
  if (unit == 'in') {
    var conversionFactor = 1;
    var step = 0.001;
  } else {
    var step = 0.025;
    var conversionFactor = 25.4;
  }
    if (od < 0.106*conversionFactor) {
      wallMin = (od * 0.2) / 2;
      wallMax = (od * 0.7) / 2;
      wallTol = (Math.round((0.002 * conversionFactor)/step)*step).toFixed(3);
      odTol = (Math.round((0.002 * conversionFactor)/step)*step).toFixed(3);
      minAngle = 3;
    } else if (od >= (0.107*conversionFactor) && od < (0.183*conversionFactor)) {
      wallMin = (od * 0.2) / 2;
      wallMax = (od * 0.7) / 2;
      wallTol = (Math.round((0.002 * conversionFactor)/step)*step).toFixed(3);
      odTol = (Math.round((0.002 * conversionFactor)/step)*step).toFixed(3);
      minAngle = 3;
    } else if (od > (0.183*conversionFactor) && od < (0.262*conversionFactor)) {
      wallMin = (od * 0.2) / 2;
      wallMax = (od * 0.7) / 2;
      wallTol = (Math.round((0.002 * conversionFactor)/step)*step).toFixed(3);
      odTol = (Math.round((0.002 * conversionFactor)/step)*step).toFixed(3);
      minAngle = 4;
    } else if (od > (0.262*conversionFactor) && od < (0.340*conversionFactor)) {
      wallMin = (od * 0.2) / 2;
      wallMax = (od * 0.7) / 2;
      wallTol = (Math.round((0.003 * conversionFactor)/step)*step).toFixed(3);
      odTol = (Math.round((0.003 * conversionFactor)/step)*step).toFixed(3);
      minAngle = 5;
    } else {
      wallMin = (od * 0.2) / 2;
      wallMax = (od * 0.7) / 2;
      wallTol = (Math.round((0.004 * conversionFactor)/step)*step).toFixed(3);
      odTol = (Math.round((0.004 * conversionFactor)/step)*step).toFixed(3);
      minAngle = 5;
    }
 

  // Run all validation checks
  var checks = [
    checkMaterial(),
    checkTipId(),
    checkOD(od, conversion),
    checkLength(length, conversion),
    checkIdLength(id, tipIdLen),
    checkWall(wall, wallMin, wallMax),
    checkTaper(taper, minAngle),
    checkTaperTol(taperTolerance),
    checkLengthTol(lengthTol),
    checkOdTol(odTol, odTolerance, conversion),
    checkWallTol(wallTol, wallTolerance),
    checkIdTol(idTol, conversion),
    checkQuantity(qty)
  ];

  // Determine if all checks pass
  var allChecksPass = checks.every(check => check === true);
  
  // Update greenlight status
  var greenlight = $("#greenlight");
  if (allChecksPass) {
    $("#custom-quote").prop('checked', false);
    $("#custom-quote").trigger('change');
    greenlight.prop('checked', true);
    greenlight.trigger('change');
  } else {
    $("#custom-quote").prop('checked', true);
    $("#custom-quote").trigger('change');
    greenlight.prop('checked', false);
    greenlight.trigger('change');
  }

  // Update pricing
  $("#8-week-price").trigger('change');
}
 // end calculate
  
$("#greenlight").on('change', function() {
if(this.checked){
  $("#price-block").css('display', 'flex');
  $("#custom-dialogue").css('display', 'none');
} else {
  $("#price-block").css('display', 'none');
}
  
});
$('input[data-name=REF]').on('click', function() {
if (['Pebax 45D','Pebax 55D','Pebax 63D', 'Pebax 70D', 'Pebax 72D', 'Pebax 74D', 'Vestamid ML21'].includes($("#material-2").val()) ){
  if((($(this).val() == 'id') || ($(this).val() == 'wall'))) {
  $('#ref-dialog').dialog("open");
  }
} else {
  if((($(this).val() == 'od') || ($(this).val() == 'wall'))) {
  $('#ref-dialog').dialog("open");
}
}
});
$('#mode').on('change', function() {
if($(this).is(":checked")) {
$(".white-text,.text-block-71,.radio-button-label-3,.cert-title,.radio-button-label-2,.sales-rep,.text-block-38,.price-title,.cost,.text-block-37,.text-block-64,.text-block-65,.slider,.text-field-3,.leadtime,.shipping-title,.tol").addClass('light-text');
$('.image-171,.image-167').addClass('reverse');
$('.column-7').addClass('white-background');
$('.text-field-3.tol,.divider').addClass('gray-background');
$('.slim').addClass('no-border');
$('.range-slider').addClass('light-border');
$('#add-extrusion').addClass('blue-button');
sphereController.setValue("#e0e0e0");
$('.price-line').removeClass('chosen');
$('input[data-name=price]:checked').trigger('change');
} else {
$(".white-text,.text-block-71,.radio-button-label-3,.cert-title,.radio-button-label-2,.sales-rep,.text-block-38,.price-title,.cost,.text-block-37,.text-block-64,.text-block-65,.slider,.text-field-3,.leadtime,.shipping-title,.tol").removeClass('light-text');
$('.image-171,.image-167').removeClass('reverse');
$('.column-7').removeClass('white-background');
$('.text-field-3.tol,.divider').removeClass('gray-background');
$('.slim').removeClass('no-border');
$('.range-slider').removeClass('light-border');
$('#add-extrusion').removeClass('blue-button');
sphereController.setValue("#333");
$('.price-line').removeClass('chosen-light');
$('input[data-name=price]:checked').trigger('change');
}
});

$('input[data-name=price]').on('change', function() {
  if($("#mode").is(":checked")) {
  $('.price-line').removeClass('chosen-light');
  $(this).closest('div').addClass('chosen-light');
  } else {
  $('.price-line').removeClass('chosen');
  $(this).closest('div').addClass('chosen'); 
  }
  $("#apply-expedite").trigger('change');
});
// $('input[data-name=REF]').on('change', function() {
// $("span.blue").removeClass('hide-price');
// $("#title-"+$(this).val()).addClass('hide-price');
// $(".div-block-264").css('opacity', 1);
// $(this).closest('div.div-block-264').css('opacity', .1);
// if($(this).val() == 'id' && $(this).is(":checked")) {  $("#id-tol-2").val('REF'); $("#inner-diameter, #id-range, #id-tol-2").prop('disabled', true); $("#od, #od-range, #wall, #wall-range, #od-tol-2, #wall-tol").prop('disabled', false); if($("#wall-tol").val() == 'REF') {$("#wall-tol").val(0.001)}; if($("#od-tol-2").val() == 'REF') {$("#od-tol-2").val(0.001)}; calculate(false);}
// if($(this).val() == 'od' && $(this).is(":checked")) { $("#od-tol-2").val('REF'); $("#od, #od-range, #od-tol-2").prop('disabled', true); $("#inner-diameter, #id-range, #wall, #wall-range, #wall-tol, #id-tol-2").prop('disabled', false); if($("#wall-tol").val() == 'REF') {$("#wall-tol").val(0.001)}; if($("#id-tol-2").val() == 'REF') {$("#id-tol-2").val(0.001)}; calculate(false);}
// if($(this).val() == 'wall' && $(this).is(":checked")) {  $("#wall-tol").val('REF'); $("#wall, #wall-range, #wall-tol").prop('disabled', true); $("#inner-diameter, #id-range, #od, #od-range, #od-tol-2, #id-tol-2").prop('disabled', false); if($("#id-tol-2").val() == 'REF') {$("#id-tol-2").val(0.001)}; if($("#od-tol-2").val() == 'REF') {$("#od-tol-2").val(0.001)};}
// calculate(true);
// });
$("#cert-0-dialog").click(function(){ $("#cert-0").dialog("open"); });
$("#cert-1-dialog").click(function(){ $("#cert-1").dialog("open"); });
$("#cert-2-dialog").click(function(){ $("#cert-2").dialog("open"); });
$("#cert-3-dialog").click(function(){ $("#cert-3").dialog("open"); });
$("#qty-popup").click(function(){ $("#qty-dialog").dialog("open"); });

// $("#id-range").on('input', function() {
// if ($("#unit").val() == 'in'){var tol = 0.002;var sig = 3; var wsig = 4;}else{var tol= 0.05;var sig = 2; var wsig = 3;}
// $("#inner-diameter").val(Number(this.value).toFixed(sig));

// var od = Number($("#od-range").val());
// var wall = Number($("#wall-range").val());

// if(Number(this.value) >= (od - tol)) {

// var expandedOD = Number(this.value) + tol;
// odController.setValue(expandedOD);
// $("#od-range").val(expandedOD.toFixed(sig));
// $("#od").val(expandedOD.toFixed(sig));

// }

// if($(":radio[value=wall]").is(":checked")) {
//   $("#wall, #wall-range").val(((od-Number(this.value))/2).toFixed(wsig));
// };

// if($(":radio[value=od]").is(":checked")) {
//   $("#od, #od-range").val((Number(this.value)+(wall*2)).toFixed(sig));
//   odController.setValue((Number(this.value)+(wall*2)).toFixed(sig))
// };
// idController.setValue(Number(this.value).toFixed(sig));
//   calculate(false);
// });

// $("#taper").on('change', function() {
//   angleController.setValue(this.value);
//   $("#taper-range").val(this.value);
//   if(Number(this.value) > 15) {
//     $("#taper").val(15);
//     $("#taper-range").val(15);
//   }
//   if(Number(this.value) < 2) {
//     $("#taper").val(2);
//     $("#taper-range").val(2);
//   }
//   calculate(true);
// });
// $("#taper-range").on('input', function() {
//   angleController.setValue(this.value);
//   $("#taper").val(this.value);
//   calculate(true);
// });
// $("#taper-tol").on('input', function() {
//   if(this.value > 5) {
//   $("#high-tol").dialog("open");
// }
//   calculate(true);
// });


// $("#tip-id").on('change', function() {
//   tipController.setValue(Number(this.value));
//   $("#od").trigger('change');
// });


// $("#inner-diameter").on('change', function() {
// var od = Number($("#od-range").val());
// if ($("#unit").val() == 'in'){var tol = 0.002;var sig = 3; var wsig = 4;var min = 0.014; var max = 0.300;}else{var tol= 0.05;var sig = 2; var wsig = 3;var min = 0.355; var max = 7.62;}
// if(this.value > max) { this.value = max; }
// else if(this.value < min) { this.value = min;}
// var getValue = $(this).val();
// $("#id-range").val(Number(getValue).toFixed(sig));

// var wall = Number($("#wall-range").val());
// if(Number(getValue) >= (od - tol)) {
// var expandedOD = Number(getValue) + Number(tol);

// odController.setValue(expandedOD);
// $("#od-range").val(expandedOD.toFixed(sig));
// $("#od").val(expandedOD.toFixed(sig)).trigger('change');
// }

// if($(":radio[value=wall]").is(":checked")) {
//   $("#wall, #wall-range").val(((od-Number(getValue))/2).toFixed(wsig)).trigger('change');
// };
// idController.setValue(Number(getValue).toFixed(sig));
// if($(":radio[value=od]").is(":checked")) {
//   $("#od, #od-range").val((Number(getValue)+(wall*2)).toFixed(sig));
//   odController.setValue((Number(getValue)+(wall*2)).toFixed(sig));
// };

// calculate(false);

// });

  
// $("#od-range").on('input', function(e) {
// if ($("#unit").val() == 'in'){var idMin = 0.014; var tol = 0.002;var sig = 3; var wsig = 4;}else{var idMin = 0.355; var tol= 0.05;var sig = 2; var wsig = 3;}
// $("#od").val(Number(this.value).toFixed(sig));

// var id = Number($("#id-range").val());
// var wall = Number($("#wall-range").val());

// //if((Number(this.value)-(wall*2)) < idMin) { $("#od-range,#od").val((wall*2) + id); e.preventDefault(); return false; }
// // if(Number(this.value) < (id + tol)) {
// // var expandedID = Number(this.value) - tol;
// // idController.setValue(expandedID);
// // $("#id-range").val(expandedID.toFixed(sig));
// //  $("#inner-diameter").val(expandedID.toFixed(sig));
// // }
   
// // if($(":radio[value=id]").is(":checked")) {
// //   $("#inner-diameter, #id-range").val((Number(this.value)-(wall*2)).toFixed(sig));
// //   idController.setValue((Number(this.value)-(wall*2)).toFixed(sig));
// // };

// // if($(":radio[value=wall]").is(":checked")) {
// //   $("#wall, #wall-range").val(((Number(this.value)-id)/2).toFixed(wsig));
// // };
// odController.setValue(Number(this.value).toFixed(sig));
// idController.setValue((Number(this.value) - (wall * 2)).toFixed(sig));
// var tol = ((Number(this.value) * 0.15) / 2);
// $("#wall, #wall-range").attr('min', tol.toFixed(wsig)); 
  
// $("#inner-diameter").val((Number(this.value) - (wall * 2)).toFixed(sig));
// ////////////////////////////////////////////////////////////////////////////////////////
// $("wall, #wall-range").attr("max", ((Number(this.value)-(Number($("#tip-id").val())))/2)-(Number($("#wall-tol").val())*2));
// var minW = ((Number(this.value) * 0.2) /2) - Number($("#wall-range").attr('min'));
// var maxW = ((Number(this.value) * 0.7) /2) - Number($("#wall-range").attr('min'));
// var max = Number($("#wall-range").attr('max')) - Number($("#wall-range").attr('min'));
// if ( ((Number(this.value) * 0.7) /2) > Number($("#wall-range").attr("max"))) {
//   maxW = max;
// }
// var maxP = (maxW / max)*100;
// if ($("#wall-possibility")) {
// $("#wall-possibility").remove();

// }
// $("#wall-slider-container").append(`<div id="wall-possibility" style="position:absolute;border: 2px solid #8ac1c3; border-bottom:none;border-radius: 5px 5px 0px 0px; top:-5px;height:7px;width:`+ (((maxW / max)*100) - ((minW / max)*100)) +`%;left:`+ ((minW / max)*100) +`%;"></div>`);
// $("#wall, #wall-range").trigger('change');
//   calculate(false);
// });

// $("#od").on('change', function() {
// if ($("#unit").val() == 'in'){var sig = 3; var wsig = 4; var min = 0.018; var max = 0.350;}else{var sig = 2; var wsig = 3;var min = 0.457; var max = 8.89;}
// var id = Number($("#id-range").val()).toFixed(sig);
// var preRoll = this.value;
// if(this.value > max) { this.value = max;}
// else if(this.value < min) { this.value = min;}
// var getValue = $(this).val();
// $("#od-range").val(Number(getValue).toFixed(sig));

// var wall = Number($("#wall-range").val());
// // if(Number(getValue) <= (id + tol)) {
// // var expandedID = Number(getValue) - tol;

// // idController.setValue(expandedID);
 
// // $("#id-range").val(expandedID.toFixed(sig));
// // $("#inner-diameter").val(expandedID.toFixed(sig));
// // }
// if(preRoll > max) {odController.setValue(Number(getValue).toFixed(sig));};
// // if($(":radio[value=id]").is(":checked")) {

// //   $("#inner-diameter, #id-range").val((Number(getValue)-(Number(wall)*2)).toFixed(sig));
// //   $("#wall, #wall-range").val(((Number(getValue)-Number($("#inner-diameter").val()))/2).toFixed(wsig));
// //   $("#inner-diameter, #id-range").trigger('change');
// //   //idController.setValue((Number(getValue)-(wall*2)).toFixed(sig));
// // };

// // if($(":radio[value=wall]").is(":checked")) {
// //   $("#wall, #wall-range").val(((Number(getValue)-id)/2).toFixed(wsig)).trigger('change');
// // };
// //if(preRoll < min) {odController.setValue(Number(getValue).toFixed(sig));};
//   var tol = ((Number(this.value) * 0.15) / 2);
//   var testMin = tol.toFixed(wsig);
//   $("#wall, #wall-range").attr('min', tol.toFixed(wsig));
  
//   odController.setValue(Number(this.value).toFixed(sig));
//   idController.setValue((Number(this.value) - (wall * 2)).toFixed(sig));
//   $("#inner-diameter").val((Number(this.value) - (wall * 2)).toFixed(sig));
// console.log(Number(this.value));
// console.log(Number($("#tip-id").val()));
// console.log(Number($("#wall-tol").val()));
// var testMax = ((Number(this.value)-(Number($("#tip-id").val())))/2)-(Number($("#wall-tol").val())*2);
// $("wall, #wall-range").attr("max", ((Number(this.value)-(Number($("#tip-id").val())))/2)-(Number($("#wall-tol").val())*2));

// var minW = ((Number(this.value) * 0.2) /2) - Number($("#wall-range").attr('min'));
// var maxW = ((Number(this.value) * 0.7) /2) - Number($("#wall-range").attr('min'));
// var max = Number($("#wall-range").attr('max')) - Number($("#wall-range").attr('min'));
// if ( (Number(this.value) * 0.7 /2) > Number($("#wall-range").attr("max"))) {
//   maxW = max;
// }
// var maxP = (maxW / max)*100;
// if ($("#wall-possibility")) {
// $("#wall-possibility").remove();
// }
// $("#wall-slider-container").append(`<div id="wall-possibility" style="position:absolute;border: 2px solid #8ac1c3; border-bottom:none;border-radius: 5px 5px 0px 0px; top:-5px;height:7px;width:`+ (((maxW / max)*100) - ((minW / max)*100)) +`%;left:`+ ((minW / max)*100) +`%;"></div>`);
// $("#wall, #wall-range").trigger('change');
//   calculate(false);
// });



// $("#wall-range").on('input', function() {
// if ($("#unit").val() == 'in'){var sig = 3; var wsig = 4;}else{var sig = 2; var wsig = 3;}


// var id = Number($("#id-range").val());
// var od = Number($("#od-range").val());
// var tol = ((od * 0.15) / 2);
// if(Number(this.value) < tol) {
//    $("#wall, #wall-range").val(tol.toFixed(wsig)); 
// } else {
//   $("#wall").val(Number(this.value).toFixed(wsig));
// }

// // if($(":radio[value=id]").is(":checked")) {
//    if($("#unit").val() == 'in'){ var margin = 0.014; } else { var margin =  .0355; }
//    $("wall, #wall-range").attr("max", ((Number($("#od").val())-(Number($("#tip-id").val())))/2)-(Number($("#wall-tol").val())*2));

//    $("#inner-diameter, #id-range").val((od-(Number(this.value)*2)).toFixed(sig));
//    idController.setValue((od-(Number(this.value)*2)).toFixed(sig));
// // };

// // if($(":radio[value=od]").is(":checked")) {
// //   $("#od, #od-range").val((id+(Number(this.value)*2)).toFixed(sig));
// //   odController.setValue((id+(Number(this.value)*2)).toFixed(sig));
// // };
//   calculate(true);
// });

// $("#wall").on('change', function() {
// if ($("#unit").val() == 'in'){var tol = 0.002;var sig = 3; var wsig = 4; var max = 0.05; var min = 0.0005;}else{var tol= 0.05;var sig = 2; var wsig = 3; var max = 1.27; var min = 0.0127;}
// //if(this.value > max) { this.value = max;}
// //else if(this.value < min) { this.value = min;}
// var getValue = $(this).val();
// var id = Number($("#id-range").val());
// var od = Number($("#od-range").val());
// var tol = ((od * 0.15) / 2);
// if(Number(this.value) < tol) {
//    $("#wall, #wall-range").val(tol.toFixed(wsig)); 
// } else {
//   $("#wall-range").val(Number(this.value).toFixed(wsig));
// }
// // if($(":radio[value=id]").is(":checked")) {
//    if($("#unit").val() == 'in'){ var margin = 0.02; } else { var margin =  .508; }
//    $("wall, #wall-range").attr("max", ((Number($("#od").val())-(Number($("#tip-id").val())))/2)-(Number($("#wall-tol").val())*2));
//    $("#inner-diameter, #id-range").val((od-(Number(getValue)*2)).toFixed(sig)).trigger('change');
//    idController.setValue((od-(Number(getValue)*2)).toFixed(sig));
// // };

// // if($(":radio[value=od]").is(":checked")) {
// //   $("#od, #od-range").val((id+(Number(getValue)*2)).toFixed(sig)).trigger('change');
// //   odController.setValue((id+(Number(getValue)*2)).toFixed(sig));
// // };
//   calculate(true);
// });

// $("#id-tol-2,#od-tol-2,#wall-tol").on('input', function() {
// if(this.value > (Number($("#inner-diameter").val())*.2)) {
//   $("#high-tol").dialog("open");
// }
  
//});  
// $("#length-range").on('input', function() {
// $("#length").val(this.value);
// calculate(true);
// });

// $("#length").on('change', function() {
// $("#length-range").val(this.value);
// calculate(true);
// });
// $("#quantity-2").on('change', function() {
// if(this.value == 'More') {
// $("#custom-quantity").css('display', 'block');
// } else {
// $("#custom-quantity").css('display', 'none');
// }
// calculate(true);
// });

// $("#custom-quantity").on('change', function() {
//   if(this.value < 51) {$("#custom-quantity").val(51)}
// });

// function changeRef(material) {
// if (['Pebax 45D','Pebax 55D','Pebax 63D','Pebax 72D','Vestamid ML21','PET','Delrin'].includes(material)) {
//   $("input[id=od-4]").prop('checked', true).trigger('change');
  
// } else {
//   $("input[id=id-3]").prop('checked', true).trigger('change');
// }
// }
// $("#tipId").on('change', function() {
//   removeError('tip-id');
//   $("#od").trigger('change');
//   calculate(false);
// });

// $("#material-2").on('change', function() {
//   removeError('material');
//  // changeRef(this.value);
//   calculate(false);
  
//   if (['Pebax 25D','Pebax 35D','Pebax 45D','Pebax 55D','Pebax 63D','Pebax 72D','Vestamid ML21'].includes(this.value)) { $("#colorant").empty().append('<option value="">Select a Color...</option><option value="White">White</option><option value="Black">Black</option><option value="Cool Grey (7C)">Cool Grey (7C)</option><option value="Green (3248C)">Green (3248C)</option><option value="Green (3268C)">Green (3268C)</option><option value="Green (3298C)">Green (3298C)</option><option value="Blue (290C)">Blue (290C)</option><option value="Blue (295C)">Blue (295C)</option><option value="Blue (2925C)">Blue (2925C)</option><option value="Blue (301C)">Blue (301C)</option><option value="Purple (2655C)">Purple (2655C)</option>'); return }
//   if (['LDPE'].includes(this.value)) {$("#colorant").empty().append('<option value="None">None</option><option value="Cool Grey (4C)">Cool Grey (4C)</option>'); $("#color-2").empty().append('<option value="None">None</option><option value="BaSO4">20% BaSO4</option>').trigger('change');  return;}
//   if (['HDPE'].includes(this.value)) {$("#color-2").empty().append('<option value="None">None</option>'); $("#colorant").empty().append('<option value="None">None</option><option value="Cool Grey (4C)">Cool Grey (4C)</option>'); return;}
//   if (['Delrin','PET','Tecoflex 80A','Pellethane 80AE','Pellethane 90AE','Pellethane 55D','Pellethane 65D','NeuSoft UR862A','NeuSoft UR842A','NeuSoft UR852A','NeuSoft UR873A'].includes(this.value)) { $("#colorant option:first-child").prop("selectedIndex",0); $("input[id=color]").prop("checked", false).trigger("change").prop("disabled", true); $("#colorant").css('display', 'none'); return;} else { $("input[id=color]").prop("disabled", false); }
//   if (['Pebax 25D','Pebax 35D','Pebax 55D', 'Pebax 63D', 'Pebax 72D', 'Pebax 45D'].includes(this.value)) { $("#color-2").empty().append('<option value="None">None</option><option value="BaSO4">20% BaSO4</option><option value="Lubricious Additive">Lubricious Additive</option><option value="BaSO4 & Lubricious Additive">20% BaSO4 & Lubricious Additive</option>'); return;} 
//   if (['Pebax 40D','Pebax 70D'].includes(this.value)) { $("#color-2").empty().append('<option value="None">None</option><option value="BaSO4">20% BaSO4</option>'); return;} 
//   if (['Vestamid ML21'].includes(this.value)) { $("#color-2").empty().append('<option value="None">None</option><option value="Lubricious Additive">Lubricious Additive</option>'); return; }
//   else { $("#color-2").empty().append('<option value="None">None</option>'); }
 
// });
// $("#color").on('change', function() {
// if ($(this).is(':checked')) {
// opacityController.setValue(1);
// if($("#colorant").val()){var mat = $("#colorant").val();} else {var mat ='#ffffff';}
// materialController.setValue(mat);
// } else {
// opacityController.setValue(.85);
// materialController.setValue('#ffffff');
  
// }
// });
// $("#colorant").on('change', function() {
// materialController.setValue(this.value);
  
// });
// $("#color-2").on('change', function() {
// if(($("#material-2").val() == 'LDPE') && (this.value == 'BaSO4')) {
//   $("#color").prop("checked", true).trigger('change');
//   $("#colorant").empty().append('<option value="Cool Grey (4C)">Cool Grey (4C)</option>');
//   $("#colorant").val('Cool Grey (4C)');
//   materialController.setValue('Cool Grey (4C)');
// }
// if(($("#material-2").val() == 'LDPE') && (this.value == 'None')) {
//   $("#color").prop("checked", false).trigger('change');
//   $("#colorant").empty().append('<option value="None">None</option>');
//   $("#colorant").val('None');
//   materialController.setValue('#ffffff');
// }
  
// });

// $("#length-tol-2").on('change', function() {
//   calculate(true);
// });


// $("#id-tol-2").on('change', function() {
//   calculate(true);
// });
// $("#od-tol-2").on('change', function() {
//   calculate(true);
// });
// $("#wall-tol").on('change', function() {
//   calculate(true);
// });
renderer.setAnimationLoop((_) => {
let t = clock.getElapsedTime();
var obj = scene.getObjectByName( "obj" );
scene.rotation.y += rotate;
controls.update();
renderer.render(scene, camera);
});

function takeScreenshot() {
var bg = scene.getObjectByName( "bg" );
bg.visible = false;
scene.rotation.y = 35;
renderer.render(scene, camera);
renderer.domElement.toBlob(function(blob){
var a = document.createElement('a');
var url = URL.createObjectURL(blob); 
var reader = new FileReader();
reader.readAsDataURL(blob); 
reader.onloadend = function() {
var base64data = reader.result;                
}
a.href = url;
a.download = 'Extrusion.png';
a.click();
}, 'image/png', 1.0);

bg.visible = true;
}
function sendScreenshot() {
var bg = scene.getObjectByName( "bg" );
bg.visible = false;
scene.rotation.y = 35;
renderer.render(scene, camera);
renderer.domElement.toBlob(function(blob){
var a = document.createElement('a');
var url = URL.createObjectURL(blob);
var reader = new FileReader();
reader.readAsDataURL(blob); 
reader.onloadend = function() {
var base64data = reader.result;                
$("#screenshot").val(base64data);
}
}, 'image/png', 1.0);
bg.visible = true;
}
$(window).keydown(function(event){
if(event.keyCode == 13) {
event.preventDefault();
return false;
}
});

function exportBinary() {
var bg = scene.getObjectByName( "bg" );
bg.visible = false;
var len = $("#length").val();
lengthController.setValue(len);
var obj = scene.getObjectByName( "obj" );
const result = exporter.parse( obj, { binary: true } );
saveArrayBuffer( result, 'extrusion.stl' );
lengthController.setValue(1);
bg.visible = true;
}
function save( blob, filename ) {
const link = document.createElement( 'a' );
link.href = URL.createObjectURL( blob );
link.download = filename;
link.click();
}
function saveArrayBuffer( buffer, filename ) {
save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

}




//UNIT
$("#unit").on('change', function() {
  var prevalues = [];
  var preTolValues = [];
  $(".dim").each(function(index){

      var preval = $(this).val();
      prevalues.push({value: preval});
    
  });
    $(".tol").each(function(index){

      var preTolVal = $(this).val();
      preTolValues.push({value: preTolVal});
    
  });
  
  if(this.value == 'in') {

  $("#length, #length-range").attr({
    "min": 0,
    "max": 100,
    "step": 1
  });
  $("#length-tol-2").attr({
    "min": 0,
    "step": 0.001
  });
  $("#od, #od-range").attr({
    "min": 0.079,
    "max": 0.350,
    "step": 0.001
  });
  $("#od-tol-2").attr({
    "min": 0,
    "step": 0.001
  });
  var newWallMin = Number($("#wall").attr('min')) / 25.4;
  var newWallMax = Number($("#wall").attr('max')) / 25.4;
  $("#wall, #wall-range").attr({
    "min": newWallMin,
    "max": newWallMax,
    "step": 0.0005
  });
  $("#wall-tol").attr({
    "min": 0,
    "step": 0.001
  });
  $("#inner-diameter").attr({
    "min": 0.014,
    "max": 0.300,
    "step": 0.001
  });
    var newtipLenMax = Number($("#tip-id-len").attr('max')) / 25.4;
    $("#tip-id-len, #tip-id-len-range").attr({
    "max": newtipLenMax,
    "step": 0.001
  });

    camera.position.set(-3, 5, 20).setLength(5);
    
    //controls.maxDistance = 50;
    
   //convert values
  $(".dim:not(.taper)").each(function(index){
    if($(this).val() !== 'MIN') {
    if($(this).attr('id').includes("range") ) {
    var val = Number(prevalues[index]["value"]) / 25.4;
    var step = Number($(this).attr('step'));
 
    if(step.toString().includes('.')) {
      var dec = step.toString().split('.')[1].length;
    } else {
      var dec = step.toString().length;
    }
    $(this).val((Math.round(val / step) * step).toFixed(dec))
    $(this).trigger("change", true);
    }
    }
  });
  $(".tol:not(.taper)").each(function(index){
    if($(this).val() !== 'MIN') {
    
    var val = Number(preTolValues[index]["value"]) / 25.4;
    var step = Number($(this).attr('step'));
 
    if(step.toString().includes('.')) {
      var dec = step.toString().split('.')[1].length;
    } else {
      var dec = step.toString().length;
    }
    $(this).val((Math.round(val / step) * step).toFixed(dec))
    $(this).trigger("change", true);
    
    }
  });  
  } //end if in
  else {
    $("#length, #length-range").attr({
    "min": 0,
    "max": 2540,
    "step": 25
  });
  $("#length-tol-2").attr({
    "min": 0,
    "step": 0.025
  });
  $("#od, #od-range").attr({
    "min": 2,
    "max": 8.89,
    "step": 0.025
  });
  $("#od-tol-2").attr({
    "min": 0,
    "step": 0.025
  });
  var newWallMin = Number($("#wall").attr('min')) * 25.4;
  var newWallMax = Number($("#wall").attr('max')) * 25.4;
  $("#wall, #wall-range").attr({
    "min": newWallMin,
    "max": newWallMax,
    "step": 0.0125
  });
  $("#wall-tol").attr({
    "min": 0,
    "step": 0.025
  });
  $("#inner-diameter").attr({
    "min": 0.355,
    "max": 7.62,
    "step": 0.025
  });
  var newtipLenMax = Number($("#tip-id-len").attr('max')) * 25.4;
  $("#tip-id-len, #tip-id-len-range").attr({
    "max": newtipLenMax,
    "step": 0.025
  });
camera.position.set(-3, 5, 20).setLength(75);
 //convert values
  $(".dim:not(.taper)").each(function(index){
    if($(this).val() !== 'MIN') {
    if($(this).attr('id').includes("range")) {
    var val = Number(prevalues[index]["value"]) * 25.4;
    var step = Number($(this).attr('step'));
   
    if(step.toString().includes('.')) {
      var dec = step.toString().split('.')[1].length;
    } else {
      var dec = step.toString().length;
    }
    $(this).val((Math.round(val / step) * step).toFixed(dec));
    $(this).trigger("change", true);
    }
    }
  });
     $(".tol:not(.taper)").each(function(index){
    if($(this).val() !== 'MIN') {
    
    var val = Number(preTolValues[index]["value"]) * 25.4;
    var step = Number($(this).attr('step'));
 
    if(step.toString().includes('.')) {
      var dec = step.toString().split('.')[1].length;
    } else {
      var dec = step.toString().length;
    }
    $(this).val((Math.round(val / step) * step).toFixed(dec))
    $(this).trigger("change", true);
    
    }
  });  
  }
updateParams();
 
  
});

//UNIT
// $("#unit").on('change', function(event, previousUnit) {
//   if(this.value == previousUnit) {return;}
  
//   // Store current values
//   var originalValues = {};
//   $(".updater").each(function() {
//     if ($(this).attr('type') !== 'checkbox' && $(this).val() !== '') {
//       originalValues[this.id] = Number($(this).val());
//     }
//   });
  
//   var conversionFactor = (this.value == 'in') ? (1/25.4) : 25.4;
  
//   // Update all dimensional values
//   Object.keys(originalValues).forEach(function(id) {
//     if ($("#" + id).hasClass('dim')) {
//       var convertedValue = originalValues[id] * conversionFactor;
//       var step = Number($("#" + id).attr('step'));
//       var decimals = step.toString().includes('.') ? step.toString().split('.')[1].length : 0;
//       var roundedValue = (Math.round(convertedValue / step) * step).toFixed(decimals);
//       $("#" + id).val(roundedValue);
//     }
//   });
  
//   updateParams('unit-change');
// });

function storeHistory() {
  if(sessionStorage.getItem("history") !== null) {
  sessionStorage.removeItem("history");
  sessionStorage.removeItem("rewards");
  }
  var previous = $("#quote").html();
  var previousReward = Number($("#reward-counter").val());
  sessionStorage.setItem("history", previous);
  sessionStorage.setItem("rewards", previousReward);
}
function getHistory() {
  var history = sessionStorage.getItem("history");
  if(history !== null) {
    if (confirm("Looks like you were already working on a quote, would you like to pick up where you left off?") == true) {
      $("#quote").empty().append(history);
      $("#quote-panel").css('display', 'flex');
      $(".lil-gui").addClass('hide-price');
       var getTotal = $(".price-item");
       var total = 0;
       for(var i = 0; i < getTotal.length; i++){
       total += Number($(getTotal[i]).val());
       }
      var shippingTotal = Number($("#shipping-total").val());
      $("#total-text").text(total + shippingTotal);
      $("#continue-to-checkout").removeClass('hide-price');

      var totalExpedites = Number(sessionStorage.getItem("rewards"));
      var expeditesInQuote = $(document).find('.expedited:checked').length;
      if ( totalExpedites > 0 ) {
        $("#reward-counter").val(totalExpedites);
        $("#expedites-remaining").text(totalExpedites);
        $("#reward-box").removeClass('hide-price');
      } else {
        $("#reward-box").addClass('hide-price');
      }
    } else {
      sessionStorage.removeItem("history");
      sessionStorage.removeItem("rewards");
    }
  }
  
}
getHistory();
function createLine(){
  var find = $(".line");
var lineItem = find.length +1
var id = $("#inner-diameter").val();
var od = $("#od").val();
var wall = $("#wall").val();
var length = $("#length").val();
var taper = $("#taper").val();
var taperTol = $("#taper-tol").val();
var tipId = $("#tip-id").val();
var odTol = $("#od-tol-2").val();
var wallTol = $("#wall-tol").val();
var lenTol = $("#length-tol-2").val();
var material = $("#material-2").val();
var additive = $("#color-2").val();
  if($("#apply-expedite").is(":checked")) {
  var expedite = `style="display: block;margin-right:5px;" checked`;
  var label = `style="display:flex;"`;
  } else {
  var expedite = `style="display:none;margin-right:5px;"`;  
  var label = `style="display:none;"`;
  }
var color = $("#colorant").val();
if($("#quantity-2").val() == 'More') {
  var quantity = $("#custom-quantity").val();
} else {
  var quantity = $("#quantity-2").val();
}
var cert = $('input[data-name=cert]:checked').val();
var unit = $("#unit").val();
var price = $('#'+ $('input[data-name=price]:checked').val()).val();
var leadtime =  $('input[data-name=price]:checked').val();
if($("#shipping-carrier").val()) {var shipping = $("#custom-method").val(); var account = $("#shipping-account").val(); var carrier = $("#shipping-carrier").val(); $("#custom-carrier").val(carrier); $("#account-number").val(account);} else  {var shipping = $("#shipping-method").val(); var account = ""; var carrier = "";};
if(!$("#custom-quote").is(":checked")){
var lineHtml = 
`<div class="line" id="line`+lineItem+`">
<div class="title-block"><p class="delete">x</p><p class="line-title">Line `+ lineItem +` (`+ unit +`)</p><p class="edit" id="`+ lineItem +`">Edit</p></div>

<div class="row">
	<div class="col">
		<div class="item"><p class="label">ID</p><input class="quote-input" id="l`+lineItem+`-id" value="`+id+`" readonly></input></div>
  	<div class="item"><p class="label">OD</p><input class="quote-input" id="l`+lineItem+`-od" value="`+od+`" readonly></input></div>
    <div class="item"><p class="label">Wall</p><input class="quote-input" id="l`+lineItem+`-wall" value="`+wall+`" readonly></input></div>
  	<div class="item"><p class="label">Length</p><input class="quote-input line-length" id="l`+lineItem+`-length" value="`+length+`" readonly></input></div>
    <div class="item"><p class="label">Taper</p><input class="quote-input" id="l`+lineItem+`-taper" value="`+taper+`" readonly></input></div>
    <div class="item"><p class="label">Tip ID</p><input class="quote-input" id="l`+lineItem+`-tip-id" value="`+tipId+`" readonly></input></div>
    <div class="item"><p class="label">Material</p><input class="quote-input" id="l`+lineItem+`-material" value="`+material+`" readonly></input></div>
    <div class="item"><p class="label">Color</p><input class="quote-input" id="l`+lineItem+`-color" value="`+color+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Price($)</p><input class="quote-input price-item" id="l`+lineItem+`-price" value="`+price+`" readonly></input></div>
    <div class="item"><p class="label">Cert Level</p><input class="quote-input" id="l`+lineItem+`-cert" value="`+cert+`" readonly></input></div>
    <input class="linenumber" id="l`+lineItem+`-line" value="`+lineItem+`" readonly style="display:none;"></input>
    <input class="quote-input unit" id="l`+lineItem+`-unit" value="`+unit+`" readonly style="display:none;"></input>
    <input type="checkbox" class="line-greenlight" id="l`+lineItem+`-greenlight" value="`+greenlight+`" readonly style="display:none;"></input>
    <label class="label" `+ label +`><input type="checkbox" class="expedited" id="l`+lineItem+`-expedite" readonly `+ expedite +` onclick="return false"></input>Free Expedite Applied</label>
	</div>
	<div class="col">
  	<div class="item"><p class="label">ID Tol</p><input class="quote-input" id="l`+lineItem+`-id-tol" value="REF" readonly></input></div>
    <div class="item"><p class="label">OD Tol</p><input class="quote-input" id="l`+lineItem+`-od-tol" value="`+odTol+`" readonly></input></div>
    <div class="item"><p class="label">Wall Tol</p><input class="quote-input" id="l`+lineItem+`-wall-tol" value="`+wallTol+`" readonly></input></div>
    <div class="item"><p class="label">Length Tol</p><input class="quote-input" id="l`+lineItem+`-length-tol" value="`+lenTol+`" readonly></input></div>
    <div class="item"><p class="label">Taper Tol</p><input class="quote-input" id="l`+lineItem+`-taper-tol" value="`+taperTol+`" readonly></input></div>
    <div class="item"><p class="label">Additive</p><input class="quote-input" id="l`+lineItem+`-additive" value="`+additive+`" readonly></input></div>
    <div class="item"><p class="label">Quantity (Feet)</p><input class="quote-input" id="l`+lineItem+`-quantity" value="`+quantity+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Lead Time</p><input class="quote-input line-leadtime" id="l`+lineItem+`-leadtime" value="`+leadtime.replace('-price','')+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Shipping Method</p><input class="quote-input shipping-line-item" id="l`+lineItem+`-shipping" value="`+shipping+`" readonly method="`+shipping+`" carrier="`+carrier+`" account="`+account+`"></input></div>
    
  </div>
  </div>
</div>`;} else {
var lineHtml = 
`<div class="line" id="line`+lineItem+`">
<div class="title-block"><p class="delete">x</p><p class="line-title">Line `+ lineItem +` (`+ unit +`)</p><p class="edit" id="`+ lineItem +`">Edit</p></div>

<div class="row">
	<div class="col">
		<div class="item"><p class="label">ID</p><input class="quote-input" id="l`+lineItem+`-id" value="`+id+`" readonly></input></div>
  	<div class="item"><p class="label">OD</p><input class="quote-input" id="l`+lineItem+`-od" value="`+od+`" readonly></input></div>
    <div class="item"><p class="label">Wall</p><input class="quote-input" id="l`+lineItem+`-wall" value="`+wall+`" readonly></input></div>
  	<div class="item"><p class="label">Length</p><input class="quote-input line-length" id="l`+lineItem+`-length" value="`+length+`" readonly></input></div>
    <div class="item"><p class="label">Taper</p><input class="quote-input" id="l`+lineItem+`-taper" value="`+taper+`" readonly></input></div>
    <div class="item"><p class="label">Tip ID</p><input class="quote-input" id="l`+lineItem+`-tip-id" value="`+tipId+`" readonly></input></div>
    <div class="item"><p class="label">Material</p><input class="quote-input" id="l`+lineItem+`-material" value="`+material+`" readonly></input></div>
    <div class="item"><p class="label">Color</p><input class="quote-input" id="l`+lineItem+`-color" value="`+color+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Price($)</p><input class="quote-input price-item" id="l`+lineItem+`-price" value="`+price+`" readonly></input></div>
    <div class="item"><p class="label">Cert Level</p><input class="quote-input" id="l`+lineItem+`-cert" value="`+cert+`" readonly></input></div>
    <input class="linenumber" id="l`+lineItem+`-line" value="`+lineItem+`" readonly style="display:none;"></input>
    <input class="quote-input unit" id="l`+lineItem+`-unit" value="`+unit+`" readonly style="display:none;"></input>
    <input type="checkbox" class="line-greenlight" id="l`+lineItem+`-greenlight" value="`+greenlight+`" readonly style="display:none;" checked></input>
    <label class="label" `+ label +`><input type="checkbox" class=" expedited" id="l`+lineItem+`-expedite" readonly `+ expedite +` onclick="return false"></input>Free Expedite Applied</label>
	</div>
	<div class="col">
  	<div class="item"><p class="label">ID Tol</p><input class="quote-input" id="l`+lineItem+`-id-tol" value="REF" readonly></input></div>
    <div class="item"><p class="label">OD Tol</p><input class="quote-input" id="l`+lineItem+`-od-tol" value="`+odTol+`" readonly></input></div>
    <div class="item"><p class="label">Wall Tol</p><input class="quote-input" id="l`+lineItem+`-wall-tol" value="`+wallTol+`" readonly></input></div>
    <div class="item"><p class="label">Length Tol</p><input class="quote-input" id="l`+lineItem+`-length-tol" value="`+lenTol+`" readonly></input></div>
    <div class="item"><p class="label">Taper Tol</p><input class="quote-input" id="l`+lineItem+`-taper-tol" value="`+taperTol+`" readonly></input></div>
    <div class="item"><p class="label">Additive</p><input class="quote-input" id="l`+lineItem+`-additive" value="`+additive+`" readonly></input></div>
    <div class="item"><p class="label">Quantity (Feet)</p><input class="quote-input" id="l`+lineItem+`-quantity" value="`+quantity+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Lead Time</p><input class="quote-input line-leadtime" id="l`+lineItem+`-leadtime" value="`+leadtime.replace('-price','')+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Shipping Method</p><input class="quote-input shipping-line-item" id="l`+lineItem+`-shipping" value="`+shipping+`" readonly method="`+shipping+`" carrier="`+carrier+`" account="`+account+`"></input></div>
  </div>
  </div>
</div>`;  
}
 
$("#quote").append(lineHtml);
storeHistory();
  

if (user.model?.expand?.blanket_po){
      updateBlanket();
      }
updateTotal();
}
function updateBlanket() {
updateTotal();
var total = Number($("#total-price").val());
$("#blanket-value").text($("#selectedBlanket").val());
$("#remaining").text(Number($("#selectedBlanket").val()) - total);
$("#order-price").text(total);
if ( Number($("#selectedBlanket").val()) - total <= -10000 ) {
  $("#open-blanket").addClass('hide-price');
  $("#blanket-box").addClass('hide-price');
  $("#po-details").append(`<a href="mailto:`+user.model.sales_rep+`"><p class="text-block-39 center">Blanket PO has been exhausted. Click here to contact your rep.</p></a>`);
}
$("#blanket-po-number").val($('#selectedBlanket option:selected').attr('recordid'));  
$("#new-blanket-po-amount").val($("#remaining").text());
}
$("#selectedBlanket").on('change', function(){
  updateBlanket();
});
function styles() {
  var lineItem = 1;
  var greenlight = $(".line-greenlight");
  for(var i = 0; i < greenlight.length; i++){
    if ($(greenlight[i]).is(":checked")) {
    var line = $(greenlight[i]).closest('.line');
    line.find('.quote-input').addClass('red-input');
    line.addClass('red-line');
    line.find('.input-remove').addClass('hide-price');
    }
    else {
    var line = $(greenlight[i]).closest('.line');
    line.find('.quote-input').removeClass('red-input');
    line.removeClass('red-line');
    line.find('.input-remove').removeClass('hide-price');
    }
  }
  if($('.line-greenlight:checkbox:checked').length > 0) {
  
    $("#view-quote").text("View Custom Quote");
    $("#view-quote").closest('div').css('background-color', '#f06f59');
    $('input[id="final-check"]').prop("checked", false);
    $("#final-check-text").val(false);
  } else {
  
    $("#view-quote").text("View Instant Quote");
    $("#view-quote").closest('div').css('background-color', '#91c765');
    $('input[id="final-check"]').prop("checked", true);
    $("#final-check-text").val(true);
  }
  // var leadtime =$(".line-leadtime");
  // for(var i = 0; i < leadtime.length; i++){
  //   if ($(leadtime[i]).val() == '2-day') {  
      
  //     if ( user.model.credit_terms == false ) {
  //     $("#view-po").addClass('hide-price');
  //     } else {
  //     $("#view-po").removeClass('hide-price');
  //     }
  //     return;
  //   } else {
  //     $("#view-po").removeClass('hide-price');
  //   }
  // }
  
}


$("#add-extrusion").click(function() {
if($("#material-2").val() == '') {addError(
            'material',
            'Select a material to add line to quote',
            'Please select a material',
            null,
            '#material-2'
        );$("#material-2").get(0).scrollIntoView(); $("#greenlight").prop('checked', false); $("greenlight").trigger('change');  return;}
if($("#tip-id").val() == '') {addError(
            'tip-id',
            'Select a tip ID to add line to quote',
            'Please select a tip ID',
            null,
            '#tip-id'
        );;$("#tip-id").get(0).scrollIntoView(); $("#greenlight").prop('checked', false); $("greenlight").trigger('change');  return;}
if ($("#greenlight").is(":checked")){
 if(!$("#shipping-carrier").val() && !$("#shipping-method").val()) {
    $("#shipping-dialog").dialog("open");
    return false;
  }
  if($("#shipping-carrier").val() && !$("#shipping-account").val()) {
    $("#account-dialog").dialog("open");
    return false;
  }
createLine();
styles();

if( $("#apply-expedite").is(":checked") ) {
  //get total number of expedites used in the quote, including the one that was potentially just added
  var expeditesInQuote = $(document).find('.expedited:checked').length;
  var expeditesRemaining  = Number($("#reward-counter").val()) - 1;
  if ( expeditesRemaining > 0 ) {
   $("#reward-counter").val(Number($("#reward-counter").val()) - 1);
   $("#expedites-remaining").text(expeditesRemaining);
  } else {
   $("#reward-counter").val(Number($("#reward-counter").val()) - 1);
   $("#expedites-remaining").text(expeditesRemaining);
   $("#reward-box").addClass('hide-price'); 
  }
}
  
resetInputs();
$("#quote-panel").css('display', 'flex');
$("#left-panel-download").removeClass('hide-price');
$(".lil-gui").addClass('hide-price');
$("#price-block").css('display', 'none');
$("#level-0").prop('checked', true);
$("#next-step").removeClass('hide-price');
$("#continue-to-checkout").removeClass('hide-price');
} else {
  if($("#custom-quote").is(":checked")){
  $("#custom-dialogue").css('display', 'flex');
  } 
  //else { createLine(); $("#price-block").css('display', 'none'); $("#quote-panel").css('display', 'flex'); $(".lil-gui").addClass('hide-price'); styles();}
}
storeHistory();
});


function resetInputs() {
  $("#apply-expedite").prop('checked', false);
  if(Number($("#reward-counter").val()) <= 0) {
    $("#reward-box").addClass('hide-price');
  }
  $("#material-2").val('HDPE');
  $("#tip-id").val('0.035');
  $("#taper, #taper-range").val(3);
  $("#taper-tol").val(1);

  if ( $("#unit").val() == 'mm' ) { $("#unit").val('in').trigger('change'); }
  setTimeout(function() {
  $("#od,#od-range").val(0.120);
  $("#inner-diameter,#id-range").val(0.060);
  $("#wall, #wall-range").val(0.03);
  $("#od,#od-range,#inner-diameter,#id-range,#wall,#wall-range").trigger('change');
  $("#id-tol-2,#wall-tol").val(0.002).trigger('change');
}, 500);

  
  $("#length,#length-range").val(12);
  $("#length-tol-2").val('MIN');
  
  $("#quantity-2").val(50);
  $("#custom-quantity").val('');
  $("#custom-quantity").css('display','none');

  $("#color-2").val($("#color-2 option:first").val());
  $("#colorant").val($("#colorant option:first").val());
  $("#color").prop('checked', false);
  $("#color").trigger("change");
  $("#price-block").css('display', 'none');
  $("#carrier-details").addClass('hide-price');
  $("#view-carrier").text("Charge to your shipping account");
  $("#shipping-account").val("");
  $("#custom-method").empty().append('<option value="Select Method...">Select Method...</option>').val($("#custom-method option:first").val());
  $("#shipping-carrier").val($("#shipping-carrier option:first").val());
  $("#shipping-method").val($("#shipping-method option:first").val());
}

$("input[id=2-day]").click(function() {
  if( user.model.credit_terms == false ) {
  $("#2day-dialog").dialog("open");
  }
});

$("#custom-change").click(function() {
  
  $("#wall, #inner-diameter, #od, #length").css('border', 'none');
  $("#id-tol-2, #od-tol-2, #length-tol-2, #wall-tol").css('border', '1px solid white');
  $("#custom-quote").prop('checked', true);
  $("#custom-quote").trigger('change');
  if($('#editing').css('display') == 'none') { createLine(); styles();$("#next-step").removeClass('hide-price');} else { update(); styles();}
  $("#quote-panel").css('display', 'flex');
  $(".lil-gui").addClass('hide-price');
  $("#custom-dialogue").css('display', 'none');
  $(".ui-dialog-content").dialog("close");
  resetInputs();
  var message = {
  "custom_line_added": true
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
});
$("#custom-quote").on('change', function() {
  if ($(this).is(":checked")) {
    
    $("#price-block").css('display', 'none');
    //document.querySelectorAll('.input-remove').forEach(e => e.hide());
    
    //$("#wall,#length,#length-tol-2,#id-tol-2,#wall-tol,#inner-diameter,#quantity-2").removeClass("error");
  }
});

$("#continue,#continue-to-checkout,#editContinue").click(function() {
  styles();
  if($('input[id="final-check"]').is(":checked")) {
  //Order is greenlight
  $("#final-details").css('display', 'block');  
  $('html, body').animate({
        scrollTop: $("#final-details").offset().top
    }, 2000);
  updateTotal();
  updateBlanket();
  } else {
  //Order is custom
  $("#custom-menu").removeClass('hide-price');
  $('html, body').animate({
        scrollTop: $("#custom-menu").offset().top
    }, 2000);
  }
  
  $("#next-step").addClass('hide-price');
});

$("#close-quote").click(function(){
  $(".lil-gui").removeClass('hide-price');
});

$("#open-quote").click(function(){
  $(".lil-gui").addClass('hide-price');
});
$("#close-terms").click(function(){
  $("#terms").addClass('hide-price');
});
$("#add-another").click(function(){
  $("#next-step").addClass('hide-price');
  $("#quote-panel").css('display', 'none');
  $(".lil-gui").removeClass('hide-price');
});

$("#view-carrier").click(function() {
  if($("#carrier-details").hasClass('hide-price')) {
  $("#carrier-details").removeClass('hide-price');
  $(this).text("I don't want to use my shipping account");
  $("#shipping-account").val($("#account-number").val());
  if($("#custom-carrier").val()) {$("#shipping-carrier").val($("#custom-carrier").val());};
  } else {
  $("#carrier-details").addClass('hide-price');
  $(this).text('Charge to your shipping account');
  $("#shipping-account").val('');
  $("#custom-method").empty().append('<option value="Select Method...">Select Method...</option>').val($("#custom-method option:first").val());
  $("#shipping-carrier").val($("#shipping-carrier option:first").val());
  }
  $("#shipping-carrier").trigger("change");
});
$("#shipping-method").on('change', function() {
  $("#shipping-account").val('');
  $("#custom-method").empty().append('<option value="Select Method...">Select Method...</option>').val($("#custom-method option:first").val());
  $("#shipping-carrier").val($("#shipping-carrier option:first").val());
  $("#carrier-details").addClass('hide-price');
});
$("#view-po").click(function() {
  $("#po-details").css('display', 'flex');
});

$("#shipping-carrier").on('change', function() {
  if(this.value == 'UPS') {
    $("#custom-method").empty().append('<option value="Select Method...">Select Method...</option><option value="UPS Ground">UPS Ground</option><option value="UPS 2nd Day Air">UPS 2nd Day Air</option><option value="UPS 3rd Day Select">UPS 3rd Day Select</option><option value="UPS Next Day Air">UPS Next Day Air</option><option value="UPS Worldwide Expedited">UPS Worldwide Expedited</option><option value="UPS Worldwide Saver">UPS Worldwide Saver</option>');
    
  } else {
    $("#custom-method").empty().append('<option value="Select Method...">Select Method...</option><option value="FedEx Ground">FedEx Ground</option><option value="FedEx Priority Overnight">FedEx Priority Overnight</option><option value="FedEx Standard Overnight">FedEx Standard Overnight</option><option value="FedEx 2 Day">FedEx 2 Day</option><option value="FedEx Express Saver">FedEx Express Saver</option><option value="FedEx International First">FedEx International First</option><option value="FedEx International Priority">FedEx International Priority</option><option value="FedEx International Priority Express">FedEx International Priority Express</option><option value="FedEx International Economy">FedEx International Economy</option>');
  }
});

$(document).on("click", ".edit", function(){
//resetInputs();
$("#next-step").addClass('hide-price');
$("#final-details").css('display', 'none');
$("#custom-menu").addClass('hide-price');
var line = this.id;
$(".line").not("#line"+line).addClass('opacity');
$("#custom-quote").prop("checked",($("#l"+ line + "-greenlight").is(":checked")));
var previousUnit = $("#unit").val();
$("#unit").val($("#l"+ line + "-unit").val());
$("#unit").trigger('change', [previousUnit]);
$("#od, #od-range").val($("#l"+ line + "-od").val());
  //odController.setValue(Number($("#l"+ line + "-od").val()));
$("#inner-diameter").val($("#l"+ line + "-id").val());
  //idController.setValue(Number($("#l"+ line + "-id").val()));
$("#length, #length-range").val($("#l"+ line + "-length").val());
$("#taper, #taper-range").val($("#l"+ line + "-taper").val());
$("#taperTol").val($("#l"+ line + "-taper-tol").val());
$("#tipId").val($("#l"+ line + "-tip-id").val());
$("#wall").val($("#l"+ line + "-wall").val());
$("#od-tol-2").val($("#l"+ line + "-od-tol").val());
$("#wall-tol").val($("#l"+ line + "-wall-tol").val());
$("#length-tol-2").val($("#l"+ line + "-length-tol").val());
$("#material-2").val($("#l"+ line + "-material").val());
$("#color-2").val($("#l"+ line + "-additive").val());
$("#colorant").val($("#l"+ line + "-color").val());
  if($("#l"+ line + "-color").val() !== '') { $("#color") }
if(Number($("#l"+ line + "-quantity").val()) > 50) {
  $("#custom-quantity").css('display', 'block');
  $("#quantity-2").val('More');
  $("#custom-quantity").val(Number($("#l"+ line + "-quantity").val()));
} else {
  $("#quantity-2").val($("#l"+ line + "-quantity").val()); 
}  

$("#editing").css('display', 'flex');
$("#now-editing").val(line);
$(".update, .update-button").css('display', 'flex');
   if(!$("#l" + line +  "-greenlight").is(":checked")){
//var radioId = $("#l"+line+"-leadtime").val().replace('-price','');
var radioId = $("#l"+line+"-leadtime").val();
var certId = $("#l"+line+"-cert").val();
$("#"+radioId).prop('checked', true).trigger('change');
$("#level-"+certId).prop('checked', true);
   }
$("#od").trigger('change');

if($("#l"+ line + "-shipping").attr("account").length > 0) {
  $("#carrier-details").removeClass('hide-price');
  $("#view-carrier").text("I don't want to use my shipping account");
  $("#shipping-carrier").val($("#l"+ line + "-shipping").attr("carrier")).trigger('change');
  $("#shipping-account").val($("#l"+ line + "-shipping").attr("account"));
  $("#custom-method").val($("#l"+ line + "-shipping").attr("method"));
  $("#shipping-method").val($("#shipping-method option:first").val());
  
} else {
   $("#carrier-details").addClass('hide-price');
   $("#view-carrier").text("Charge to your shipping account");
   $("#shipping-method").val($("#l"+ line + "-shipping").attr("method"));
   $("#shipping-account").val("");
   $("#custom-method").val($("#custom-method option:first").val());
   $("#shipping-carrier").val($("#shipping-carrier option:first").val());
}
  
$("#submit-container").css('display', 'none');
  if(!$("#l" + line +  "-greenlight").is(":checked")){
    $("#price-block").css('display', 'flex');
  }
 
  $("#inner-diameter, #wall, #material-2").trigger('change');
  calculate(false);
  if( $("#l"+ line + "-expedite").is(":checked") ) {
  //get total number of expedites used in the quote, including the one that was potentially just added
  $("#reward-box").removeClass("hide-price");
  var expeditesRemaining  = Number($("#reward-counter").val()) + 1;
  $("#reward-counter").val(expeditesRemaining);
  $("#expedites-remaining").text(expeditesRemaining);
  $("#apply-expedite").prop('checked', true).trigger('change');
 
} 
});


function update() {
var line = $("#now-editing").val();
$("#l"+ line + "-unit").val($("#unit").val());
$("#l"+ line + "-id").val($("#inner-diameter").val());
$("#l"+ line + "-od").val($("#od").val());
$("#l"+ line + "-wall").val($("#wall").val());
$("#l"+ line + "-taper").val($("#taper").val());
$("#l"+ line + "-taper-tol").val($("#taper-tol").val());
$("#l"+ line + "-tip-id").val($("#tip-id").val());
$("#l"+ line + "-length").val($("#length").val());

$("#l"+ line + "-od-tol").val($("#od-tol-2").val());
$("#l"+ line + "-wall-tol").val($("#wall-tol").val());
$("#l"+ line + "-length-tol").val($("#length-tol-2").val());
$("#l"+ line + "-material").val($("#material-2").val());
$("#l"+ line + "-additive").val($("#color-2").val());
$("#l"+ line + "-color").val($("#colorant").val());

if($("#shipping-carrier").val()) {var shipping = $("#custom-method").val(); var account = $("#shipping-account").val(); var carrier = $("#shipping-carrier").val(); $("#custom-carrier").val(carrier); $("#account-number").val(account);} else  {var shipping = $("#shipping-method").val(); var account = ""; var carrier = "";};
$("#carrier-details").addClass('hide-price');
$("#l"+ line + "-shipping").val(shipping);
$("#l"+ line + "-shipping").attr("account", account);  
$("#l"+ line + "-shipping").attr("method", shipping);
$("#l"+ line + "-shipping").attr("carrier", carrier);  

if($("#quantity-2").val() == 'More')  {
  $("#l"+ line + "-quantity").val($("#custom-quantity").val());
} else {
$("#l"+ line + "-quantity").val($("#quantity-2").val());
}

 if(!$("#custom-quote").is(":checked")){
$("#l"+ line + "-cert").val($('input[data-name=cert]:checked').val());
$("#l"+ line + "-price").val($('#'+ $('input[data-name=price]:checked').val()).val());
$("#l"+ line + "-leadtime").val($('input[data-name=price]:checked').val().replace('-price', ''));
 }
$("#editing").css('display', 'none');
$(".update, .update-button").css('display', 'none');
$("#submit-container").css('display', 'flex');
$("#price-block").css('display', 'none');
$("#l"+ line + "-greenlight").prop("checked",($("#custom-quote").is(":checked")));
storeHistory();
updateTotal();
updateBlanket();

if ( $("#apply-expedite").is(":checked") ) {
  $("#l"+ line + "-expedite").prop('checked', true);
  $("#l"+ line + "-expedite").closest(".label").css('display', 'flex')
  var expeditesRemaining = Number($("#reward-counter").val()) - 1
  $("#reward-counter").val(expeditesRemaining);
  $("#expedites-remaining").text(expeditesRemaining);
} else {
  $("#l"+ line + "-expedite").prop('checked', false);
  $("#l"+ line + "-expedite").closest(".label").css('display', 'none')
}

}

function updateTotal() {
  calcShipping();
  var getTotal = $(".price-item");
  var total = 0;
  for(var i = 0; i < getTotal.length; i++){
  total += Number($(getTotal[i]).val());
}
var shippingTotal = Number($("#shipping-total").val());    
$("#total-price").val(total+shippingTotal);
$("#total-text").text(total+shippingTotal);
}

$("#update").click(function(){

update();
styles();
resetInputs();

$(".line").removeClass('opacity');
$("#next-step").removeClass('hide-price');
});

$(document).on("click", ".delete", function(){
  var lineId = $(this).attr('id');
  if( $("#l"+ lineId + "-expedite").is(":checked") ) {
  var expeditesRemaining = Number($("#reward-counter").val()) + 1
  $("#reward-counter").val(expeditesRemaining);
  $("#expedites-remaining").text(expeditesRemaining);
  }
  
  $(this).closest('.line').remove();
  var lineItem = 1;
  $(".line").map(function() {
    var unit = $(this).find('.unit').val();
    $(this).find('.line-title').first().text('Line '+ lineItem + ' (' + unit + ')');
    $(this).find('.linenumber').val(lineItem);
    $(this).find('.edit').first().attr("id", lineItem);
    $(this).find('input').map(function(){
      this.id = this.id.replace(/[0-9]/g, lineItem);
      
    });
  ++lineItem;
  });
  storeHistory()
  updateTotal();
  updateBlanket();

  
});

function calcShipping(packageQuote = null) {
var shippingLines = $(".shipping-line-item");
let finalShipping = [];

var priceMatchSmall = {
  "UPS Ground": 18,
  "UPS Second Day Air": 45,
  "UPS Next Day Air": 75,
  "UPS Worldwide Expedited": 90,
  "UPS Worldwide Saver": 110
};
var priceMatchLarge = {
  "UPS Ground": 55,
  "UPS Second Day Air": 105,
  "UPS Next Day Air": 140,
  "UPS Worldwide Expedited": 140,
  "UPS Worldwide Saver": 160
};
for (let i = 0; i < shippingLines.length; ++i) {
  
  if ( !$(shippingLines[i]).attr("account").length > 0 ) {
  let shippingArray = {};
  var leadtime = 'leadtime';
  var shipping = 'shipping';
  var price = 'price';
  var line = $(shippingLines[i]).closest('.line');
  var leadVal = line.find('.line-leadtime').val();
  var shipVal = $(shippingLines[i]).val();
  if ( line.find('.unit').val() == 'in' ) {
    if ( Number(line.find('.line-length').val()) < 30 ) {
    var priceVal = $(shippingLines[i]).val().replace(/UPS Ground|UPS Next Day Air|UPS Second Day Air|UPS Worldwide Expedited|UPS Worldwide Saver/g, matched => priceMatchSmall[matched]);
    } else {
    var priceVal = $(shippingLines[i]).val().replace(/UPS Ground|UPS Next Day Air|UPS Second Day Air|UPS Worldwide Expedited|UPS Worldwide Saver/g, matched => priceMatchLarge[matched]); 
    }
  } else {
    if ( Number($(shippingLines[i]).closest('.line-length').val()) < 762 ) {
    var priceVal = $(shippingLines[i]).val().replace(/UPS Ground|UPS Second Day Air|UPS Worldwide Expedited|UPS Worldwide Saver/g, matched => priceMatchSmall[matched]);
    } else {
    var priceVal = $(shippingLines[i]).val().replace(/UPS Ground|UPS Second Day Air|UPS Worldwide Expedited|UPS Worldwide Saver/g, matched => priceMatchLarge[matched]); 
    }
    
  }
  shippingArray[leadtime] = leadVal;
  shippingArray[shipping] = shipVal;
  shippingArray[price] = priceVal;
  finalShipping = finalShipping.concat(shippingArray);
  }
  
  
}
console.log(finalShipping);
//let result = finalShipping.filter(
//  (finalShipping, index) => index === finalShipping.findIndex(
//    other => finalShipping.leadtime === other.leadtime
//      && finalShipping.shipping === other.shipping
//  ));

let result = finalShipping.filter((value, index, self) =>
  index === self.findIndex((t) => (
    t.leadtime === value.leadtime && t.shipping === value.shipping
  ))
)
  
var totalShipping = 0;
result.forEach(item => {
  if(packageQuote) {
  var find = $(".line");
  var lineItem = find.length + 1;
  var lineHtml = 
  `<div class="line" id="line`+lineItem+`" style="display:none;">
		<input class="quote-input" id="l`+lineItem+`-id" value="Shipping: `+item.shipping+`" readonly></input>
  	<input class="quote-input" id="l`+lineItem+`-price" value="`+item.price+`" readonly></input>
    <input class="linenumber" id="l`+lineItem+`-line" value="`+lineItem+`" readonly style="display:none;"></input>
  </div>`;
  $("#quote").append(lineHtml);
}
    totalShipping += Number(item.price);
});
if ( totalShipping > 0 ) {
   $("#shipping-total").val(totalShipping);
} else {
  $("#shipping-total").val('0');
}
  
}


function createArray() {
  calcShipping(true); 
  var getTotal = $(".price-item");
  var total = 0;
  for(var i = 0; i < getTotal.length; i++){
    total += Number($(getTotal[i]).val());
}
    
$("#total-price").val(total);
  
  
   
  /////////
  let order = [];
  var lines = $(".line");
  for (let i = 0; i < lines.length; ++i) {
    
    let line = {};
    var inputs = $("#"+lines[i].id).find('input');
    for (let a = 0; a < inputs.length; ++a) {
      
      var id = inputs[a].id;
      if (inputs[a].id.includes('greenlight')) {
      var value = $(inputs[a]).is(":checked");
      } else if ( inputs[a].id.includes('shipping') ) { 

      if ($(inputs[a]).attr("account").length > 0) { var acct = ' Account #: ' + $(inputs[a]).attr("account"); } else { var acct = ''; };
      var value = inputs[a].value + acct; 
        
      } else {
      var value = inputs[a].value;
      }
      //line.push({ [id] : value });
      line[id] = value;
    }
    order = order.concat(line);
    
}
var output = JSON.stringify(order);
calcShipping();
 $("#quoteNum").val(sessionStorage.getItem("quoteNum"));
 $("#quoteId").val(sessionStorage.getItem("quoteId"));
 $("#order").val(output);
 $("#shipping").val($("#shipping-method").val());
 $("#custom-carrier").val($("#shipping-carrier").val());
 //$("#account-number").val($("#shipping-account").val());
 $("#user-details").val(JSON.stringify(JSON.parse(localStorage.getItem("pocketbase_auth"))));
 $("#po-number-submit").val($("#purchase-order-file").val());
 $("#preferred-method").val($("#custom-method").val());
 //$("#po-file").val($("#purchase-order-file").val());
 sessionStorage.removeItem("history");
 sessionStorage.removeItem("rewards");
 $("#quote").submit();

}
$("#checkout").click(function() {

 var getTotal = $(".price-item");
  var total = 0;
  for(var i = 0; i < getTotal.length; i++){
    total += Number($(getTotal[i]).val());
}
    var fee = (total * 0.03).toFixed(2);
   
  ///////// Ad cc processing fee
var find = $(".line");
var message = {
  "number_of_lines": find.length,
  "submitted": true,
  "checkout_method": "CC"
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
var lineItem = find.length + 1;
var lineHtml = 
`<div class="line" id="line`+lineItem+`" style="display:none;">
		<input class="quote-input" id="l`+lineItem+`-id" value="CC Processing Fee" readonly></input>
  	<input class="quote-input price-item" id="l`+lineItem+`-price" value="`+fee+`" readonly></input>
    <input class="linenumber" id="l`+lineItem+`-line" value="`+lineItem+`" readonly style="display:none;"></input>
</div>`;
   
$("#quote").append(lineHtml);  
  
 
  if( !$("#po-number").val() ) {
  $("#terms").removeClass('hide-price');
  
  }
  if( $("#po-number").val().length > 0) {
    if ($('input[id="po-verification"]').is(":checked")) { $("#terms").removeClass('hide-price'); }
    else {  $('#verification').dialog("open"); }
  } 
});

$("#upload-po").click(function() {
  $("#quote-panel").css('display','flex');
  $("#upload-container").removeClass('hide-price');
});
$("#po-buy").click(function() {
  
  $("#po-accept").removeClass('hide-price');
  
  
});
$("#po-verification").click(function() {
  if($(this).is(":checked")) {
    $("#no-po-checkout").removeClass('hide-price');
  } else {
    $("#no-po-checkout").addClass('hide-price');
  }
});
$("#charge-to-blanket").click(function() {
  $("#terms").removeClass('hide-price');
  $("#blanket-po-selected").val(true);
  var find = $(".line");
    var message = {
    "number_of_lines": find.length,
    "submitted": true,
    "checkout_method": "PO"
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
 // $("#po-number-submit").val($("#blanket-number").text());
});
$("#no-po-checkout").click(function() {
  if ($('input[id="po-verification"]').is(":checked")) { 
    $("#purchase-order-no-upload").val('no-upload'); 
    $("#terms").removeClass('hide-price');
    var find = $(".line");
    var message = {
    "number_of_lines": find.length,
    "submitted": true,
    "checkout_method": "PO"
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
  }
    else {  $('#verification').dialog("open"); }
  
});
$("#send").click(function() {
 var message = {
    "order_placed": true,
    "ended": new Date()
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
createArray();
$("#loading").css("display", "flex");
});
$("#po-checkout").click(function() {
   $("#terms").removeClass('hide-price');
    var find = $(".line");
    var message = {
    "number_of_lines": find.length,
    "submitted": true,
    "checkout_method": "PO"
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
});
$("#purchase-order-file").on('change', function() {
  $("#upload-container").addClass('hide-price');
  $("#po-checkout").removeClass('hide-price');
  setTimeout(function() {
  $("#upload-po").text($(".text-block-57.w-file-upload-file-name").text());  
  }, 100);
  $("#upload-po").css('background-color', '#91c765');
  
});
$(".close-upload").click(function() {
  $("#upload-container").addClass('hide-price');
});
$("#po-checkout").click(function() {
   $("#terms").removeClass('hide-price');
});
$(".download-quote").click(function(){
  $("#download-quote").val('true');
  $("#loading").css("display", "flex");
  $("#save-quote").val("true");
  createArray();
  
});
$("#continue-with-custom").click(function() {
  createArray();
  $("#loading").css("display", "flex");
  var find = $(".line");
  var message = {
  "number_of_lines": find.length,
  "submitted": true
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
});
