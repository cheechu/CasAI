import styles from "./SampleCard.module.scss";

export default function SampleCard() {
  return (
    <div className={styles.card}>
      <div className={styles.title}>How it works</div>
      <div className={styles.description}>
        Upload a PDB of your base editor, specify the linker region in annotations, and CasAI proposes scored redesign candidates for wet-lab validation.
      </div>
    </div>
  );
}
