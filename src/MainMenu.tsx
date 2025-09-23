import React from 'react';
import { getVariantDescription, Variant } from "./Variants";

function MainMenu(props: { variants: Variant[], onStart: (variant: Variant) => void }) {
    return <div id="mainMenu">
        <h2>Let's Get Wordy!</h2>
        {props.variants.map((variant, i) =>
            <div>
                <button key={i} onClick={() => { props.onStart(variant); }}>
                    Play {variant}
                </button>
                <br/>
                {getVariantDescription(variant)}
            </div>
        ).reduce((result, currentComponent) => {
                return !result ? currentComponent : (
                    <React.Fragment>
                        {result}
                        <hr className='dashed'/>
                        {currentComponent}
                    </React.Fragment>
                );
            })}
    </div>;
}

export default MainMenu;