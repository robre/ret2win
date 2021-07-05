  $( function() {
    $( "#gadgets, #exploit, #datapointers" ).sortable({
      connectWith: ".connectedSortable",
      placeholder: "background-blue p-6",
      cancel: ".nonome",
      update: function(e,u){ if(e.target.id == "exploit")setexecenv(); },
      remove: function(e,u){
          if(e.target.id == "gadgets" || e.target.id == "datapointers"){
            $(e.originalEvent.target).clone().appendTo(e.target);
          }
      }
    }).disableSelection();
  } );


// Global Vars

var stacklen = 32;
var stack = [0x41414141,0x41414141,0x41414141,0x41414141];
var regs = {
    "eax": 0, 
    "ebx": 0, 
    "ecx": 0, 
    "edx": 0, 
    "edi": 0, 
    "esi": 0, 
    "eip": 0, 
    "esp": 16,
};
var exploit = [];

setexecenv();
function setexecenv(){
    stacklen = 32;
    stack = ["0x41414141","0x41414141","0x41414141","0x41414141"];
    regs = {
        "eax": 0, 
        "ebx": 0, 
        "ecx": 0, 
        "edx": 0, 
        "edi": 0, 
        "esi": 0, 
        "eip": 0, 
        "esp": 16,
    };
    exploit = [];

    $("#exploit li").each(function(){exploit.push($(this).text())});

    stack = stack.concat(exploit).concat(["0x41414141","0x41414141","0x41414141","0x41414141"]);
    console.log(exploit);
    console.log(stack);
    render();
    // move exploit on to stack
    // maybe some junk data around
    // set esp to first instruction of exploit on the stack
    /*
    for line in exploit:
        if ";" not in line:
            error, not an instruction
        if "nop" continue
        if "pop"
        if "push"...
        
        */
}

function render(){
    // redraw the output part
    $('#stack').empty();
    for (let item in stack){
        var c = "bg-yellow-300";
        if (regs["esp"] == item * 4) c="bg-green-500";
        $('#stack').append('<li class="nonome border-solid rounded border-2 p-1 pr-8 pl-8 border-gray-900 ' + c+ '">[' + item*4 + '] ' + stack[item]+
             '</li>')
    }
    for(let r in regs){
        $('#' + r).text(regs[r]);
    }


}

function checkwin(){
    return (regs["eip"] == "&.system()" && regs["eax"] == "&.\"/bin/sh\"") || (regs.eax == 11 && regs.ebx == "&.\"/bin/sh\"" && regs.ecx == "&.\"/bin/sh\"" && regs.edx == 0 && regs.eip == "int 0x80;");
}

function step(){

    var instruction = stack[regs["esp"] / 4];
    console.log("ins: " + instruction);
    
    if (!instruction.includes(";") && !instruction.includes("()")){
        alert("invalid instruction: " + instruction);
        return false;
    }

    switch(instruction){
        case "ret;":
            // nop
            regs.eip = instruction;
            regs.esp += 4;
            break;
        case "pop eax; ret;":
            regs.eip = instruction;
            regs.eax = stack[(regs.esp / 4) + 1];
            regs.esp += 8;
            break;
        case "pop ebx; ret;":
            regs.eip = instruction;
            regs.ebx = stack[(regs.esp / 4) + 1];
            regs.esp += 8;
            break;
        case "pop ecx; ret;":
            regs.eip = instruction;
            regs.ecx = stack[(regs.esp / 4) + 1];
            regs.esp += 8;
            break;
        case "pop edx; ret;":
            regs.eip = instruction;
            regs.edx = stack[(regs.esp / 4) + 1];
            regs.esp += 8;
            break;
        case "&.system()":
            regs.eip = instruction;
            regs.esp += 4;
            break;
        case "xor eax, eax; ret;":
            regs.eip = instruction;
            regs.eax = 0;
            regs.esp += 4;
            break;
        case "mov edx, eax; ret;":
            regs.eip = instruction;
            regs.edx = regs.eax;
            regs.esp += 4;
            break;
        case "inc eax; ret;":
            regs.eip = instruction;
            regs.eax += 1;
            regs.esp += 4;
            break;
        case "int 0x80;":
            regs.eip = instruction;
            regs.esp += 4;
            break;
        default:
            alert("unknown instruction: " + instruction);
            return false;
            break;
    }


    render();
    if (checkwin()) {
        alert("winrar!");
        return false;
    }
    return true;
}

function run(){
    setexecenv();
    while(step()){
    }
}
