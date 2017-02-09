import React from 'react';
import ReactDOM from 'react-dom';
import Boing from '../../../static/audio/Boing.mp3';
import Ding from '../../../static/audio/Ding.mp3';
import Drop from '../../../static/audio/Drop.mp3';
import HereYouGo from '../../../static/audio/HereYouGo.mp3';
import HI from '../../../static/audio/HI.mp3';
import KnockBrush from '../../../static/audio/KnockBrush.mp3';
import Plink from '../../../static/audio/Plink.mp3';
import Tada from '../../../static/audio/Tada.mp3';
import Woah from '../../../static/audio/Woah.mp3';
import Wow from '../../../static/audio/Wow.mp3';
import Yoink from '../../../static/audio/Yoink.mp3';

class SoundsPlayer{

    constructor(props){
        window.addEventListener('load', () => {
            let container = document.createElement('div');
            container.id = 'soundPlayer';
            document.body.appendChild(container);
            this.soundsAudio = ReactDOM.render(<audio/>,container);
        });
    }

    getSoundsList(){
        return {'Boing.mp3':Boing,'Ding.mp3':Ding
            ,'Drop.mp3':Drop,'HereYouGo.mp3':HereYouGo
            ,'HI.mp3':HI,"KnockBrush.mp3":KnockBrush
            ,'Plink.mp3':Plink,"Tada.mp3":Tada
            ,'Woah.mp3':Woah,"Wow.mp3":Wow
            ,'Yoink.mp3':Yoink}
    }

    soundPlayer(sound){
        let soundsAudio = this.soundsAudio;
        let soundsListPath = this.getSoundsList();
        if (!(sound==='None'||sound==='xxx.mp3')){
            let soundPath = soundsListPath[sound];
            soundsAudio.pause();
            setTimeout(()=>{
                if (soundsAudio.paused){
                    soundsAudio.src = soundPath;
                    soundsAudio.play();
                }
            },150)
            
        }
    }
}

const playSound = new SoundsPlayer();
export default function soundPlayer(sound){
    playSound.soundPlayer(sound);
}