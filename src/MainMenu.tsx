import { getPermDataFromSaveState, MAX_LEVEL } from "./App";
import { getVariantDescription, Variant } from "./Variants";

const NEXT_VARIANT_LEVEL_REQUIREMENT = 5;

function MainMenu(props: {variants: Variant[], unlockAll: boolean, onStart: (variant: Variant) => void }) {
    const permData = getPermDataFromSaveState();
    const variantData = permData?.variantStats ?? {};
    const variantsToDisplay = [props.variants[0]];
    const variantsToHide: Variant[] = [];

    if (permData && variantData[Variant.BASE] != null) {
        for (let i = 1; i < props.variants.length; i++) {
            const lastVariantReached = variantData[props.variants[i-1]]?.maxLevelReached;
            if (props.unlockAll || (lastVariantReached != null && lastVariantReached >= NEXT_VARIANT_LEVEL_REQUIREMENT)) {
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
                {variantData[variant] != null && (variantData[variant]!.maxLevelReached >= MAX_LEVEL ? <div className="maxLevelReached">
                    Consecutive Wins: {variantData[variant]!.consecutiveWins}
                </div> : <div className="maxLevelReached">
                    Reached Level: {variantData[variant]!.maxLevelReached}
                </div>)}
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