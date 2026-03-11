export default function Majors({ formData, onUpdate, onNext, onBack }) {
    return (
        <div>
            <h1>What&apos;s your major?</h1>
            <button onClick={onNext}>Next</button>
        </div>
    );
}
