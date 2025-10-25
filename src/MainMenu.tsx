import { getVariantDescription, Variant } from "./Variants";

function MainMenu(props: { variants: Variant[], onStart: (variant: Variant) => void }) {
    return <div id="mainMenu">
        <h2>Let's Get Wordy!</h2>
        {props.variants.map((variant, i) =>
            <div key={i} className="variantInMenu">
                {getVariantDescription(variant)}
                <br/>
                <br/>
                <button onClick={() => { props.onStart(variant); }}>
                    Play {variant} Mode
                </button>
            </div>
        )}
    </div>;
}

export default MainMenu;