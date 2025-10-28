import { getPermDataFromSaveState } from "./App";
import { getVariantDescription, Variant } from "./Variants";

function MainMenu(props: {variants: Variant[], onStart: (variant: Variant) => void }) {
    const permData = getPermDataFromSaveState();
    const maxLevels: { [key in Variant]?: number } = permData ? permData.maxLevelReached : {};
    const variantsToDisplay = [props.variants[0]];
    const variantsToHide: Variant[] = [];
    if (permData && permData.maxLevelReached[Variant.BASE] != null) {
        for (let i = 1; i < props.variants.length; i++) {
            const lastVariantReached = permData.maxLevelReached[props.variants[i-1]];
            if (lastVariantReached != null && lastVariantReached >= 5) {
                variantsToDisplay.push(props.variants[i]);
            } else {
                variantsToHide.push(props.variants[i]);
                break;
            }
        }
    }

    return <div id="mainMenu">
        <h2>Let's Get Wordy!</h2>
        {variantsToDisplay.map((variant, i) =>
            <div key={i} className="variantInMenu">
                {getVariantDescription(variant)}
                <br/>
                <br/>
                <button onClick={() => { props.onStart(variant); }}>
                    Play {variant} Mode
                </button>
                {maxLevels[variant] != null && <div className="maxLevelReached">
                    Reached Level: {maxLevels[variant]}
                </div>}
            </div>
        )}
        {variantsToHide.map((variant, i) =>
            <div key={i} className="variantInMenu">
                <i>Reach Level 5 in {props.variants[props.variants.indexOf(variant)-1]} Mode to unlock ????? Mode</i>
                <br/>
                <br/>
                <button disabled={true}>
                    Play ????? Mode
                </button>
            </div>
        )}
    </div>;
}

export default MainMenu;