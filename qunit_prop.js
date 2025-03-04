    function cleanHeader(){
        let el = document.querySelector(`#qunit-header a`);
        let url = new URL(el.href);
        url.searchParams.delete("proverRndState");
        el.href = url.href;
    }

    function wrapPush(arr){
        arr._oldPush = arr.push;
        arr.push = function(...args){
            this._oldPush(...args);
            for(let arg of args){
                if(!arg[0]){
                    throw new Error(arg[1]);
                }
            }
        }
    }

    function restorePush(arr) {
        arr.push = arr._oldPush;
    }

window.property = prover.wrapFuncForProps(function(name, checker){
    test(name, function(){
        wrapPush(QUnit.config.current.assertions);
        let res = checker();
        restorePush(QUnit.config.current.assertions);
        if(res && res.err){
            //ok(false, res.err);
            let rerunEl = document.querySelector(`#${QUnit.config.current.id} a`);
            let rerun = new URL(rerunEl.href);
            rerun.searchParams.append("proverRndState", res.rndState);
            rerunEl.href = rerun.href;
        }
        else {
            ok(true, name);
        }
        cleanHeader();
    })

});