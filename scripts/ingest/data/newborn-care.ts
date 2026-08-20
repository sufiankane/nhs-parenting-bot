export interface RawChunk {
  source_id: string;
  source_url: string;
  title: string;
  category: string;
  chunk_text: string;
  chunk_index: number;
  safety_relevant: boolean;
  attribution?: string;
}

export const newbornCareChunks: RawChunk[] = [
  {
    source_id: "nhs-soothing-crying-baby",
    source_url: "https://www.nhs.uk/conditions/baby/crying-colic-and-reflux/soothing-a-crying-baby/",
    title: "Soothing a Crying Baby: Gentle Calming Techniques",
    category: "newborn-care",
    chunk_index: 0,
    safety_relevant: false,
    chunk_text: "All babies cry, and it can be difficult to know what they need in the early weeks. Crying is your baby's main way of communicating hunger, tiredness, a wet or dirty nappy, wind, or simply wanting to be close to you. To help soothe your baby, try holding them close against your chest for skin-to-skin contact, which helps regulate their heart rate, breathing, and body temperature. Gentle rhythmic rocking, swaying, softly singing, or humming can be very calming for a restless baby. Repeating gentle 'shhh' sounds or playing rhythmic white noise (such as a fan, vacuum cleaner sound, or running water) mimics the soothing sounds of the womb. Swaddling with a lightweight, breathable cotton blanket can help some newborns feel secure, making sure their hips are free to move and their chest is not constricted. Try taking baby for a gentle walk in a pram or sling, as fresh air and rhythmic movement often help settle them. If you ever feel uncertain or need extra reassurance, your health visitor or midwife is always there to support you."
  },
  {
    source_id: "nhs-soothing-crying-baby",
    source_url: "https://www.nhs.uk/conditions/baby/crying-colic-and-reflux/soothing-a-crying-baby/",
    title: "Coping with Persistent Crying: ICON Infant Safety Guidance",
    category: "newborn-care",
    chunk_index: 1,
    safety_relevant: true,
    chunk_text: "Crying is normal and all babies go through phases of intense crying, usually peaking around 6 to 8 weeks before gradually settling. If you feel stressed, exhausted, or overwhelmed by your baby's crying, remember the NHS ICON message: Infant crying is normal, Comfort methods can sometimes soothe baby, It is OK to walk away for a few minutes if you have checked baby is safe in their cot, and Never ever shake a baby. Shaking a baby can cause severe, permanent brain damage, bleeding in the eyes, or fatal head injuries. If you feel you are losing patience, place your baby safely on their back in their cot or Moses basket, step into another room, take slow deep breaths for a few minutes, or phone a trusted friend, family member, your health visitor, or the Cry-sis Helpline on 0800 028 8318. Never hesitate to seek help if you feel you cannot cope."
  },
  {
    source_id: "nhs-washing-and-bathing-baby",
    source_url: "https://www.nhs.uk/conditions/baby/caring-for-a-newborn/washing-and-bathing-your-baby/",
    title: "Washing Your Newborn: Topping and Tailing and Bath Routine",
    category: "newborn-care",
    chunk_index: 0,
    safety_relevant: false,
    chunk_text: "You do not need to give your newborn baby a full bath every day; two to three times a week is plenty to keep them clean and comfortable, as frequent bathing can dry out delicate newborn skin. In the early weeks, 'topping and tailing' using cotton wool and warm water is a gentle and practical way to keep your baby fresh between baths. To top and tail: wash your baby's face, neck, hands, and nappy area gently. Use a separate clean piece of cotton wool dipped in cooled boiled or warm water for each eye, wiping smoothly from the inner corner outwards to avoid spreading any stickiness. When giving a full bath, ensure the room is warm and free from draughts. Use plain warm water without soaps, bubble baths, or scented lotions for at least the first month, allowing your baby's natural skin barrier to mature safely. Always test the bath water temperature using your wrist or elbow; it should feel comfortably warm, never hot (around 37°C). Wrap your baby warmly in a soft towel immediately after bathing and pat their skin dry gently, paying special attention to skin creases."
  },
  {
    source_id: "nhs-washing-and-bathing-baby",
    source_url: "https://www.nhs.uk/conditions/baby/caring-for-a-newborn/washing-and-bathing-your-baby/",
    title: "Baby Bath Safety and Drowning Prevention",
    category: "newborn-care",
    chunk_index: 1,
    safety_relevant: true,
    chunk_text: "Bath time requires 100% focused, undivided attention from an adult caregiver. Babies and young children can drown silently in as little as 2 to 3 centimetres (less than an inch) of water in just a few seconds, without splashing or crying out. Always prepare everything you need before you even start running the bath water — including a soft warm towel, a fresh clean nappy, clean clothes, and cotton wool — so you never need to turn away or leave the room. Never leave your baby unattended in the bath for even a single second, regardless of whether you are using a bath seat, bath ring, or reclining bath support. Bath seats are bathing aids, not safety devices, and babies can easily slip or tip out of them. If the doorbell, phone, or someone at the door interrupts you, ignore it or lift your baby out, wrap them securely in a towel, and take them with you. When bath time is finished, hold your baby firmly as wet skin is slippery, empty the bath water completely straight away, and keep the bathroom door closed."
  },
  {
    source_id: "nhs-nappy-changing-hygiene",
    source_url: "https://www.nhs.uk/conditions/baby/caring-for-a-newborn/how-to-change-your-babys-nappy/",
    title: "Step-by-Step Nappy Changing and Hygiene",
    category: "newborn-care",
    chunk_index: 0,
    safety_relevant: false,
    chunk_text: "Changing your baby's nappy regularly helps protect their delicate skin and prevents soreness and nappy rash. Change nappies promptly whenever they are wet or dirty, typically before or after every feed and whenever your baby wakes up. Set up a clean, safe changing mat on the floor or on a sturdy changing table where you always keep one hand securely on your baby to prevent falls. In the first few weeks after birth, plain warm water and soft cotton wool pads are the gentlest way to clean your baby's skin. Wipe gently from front to back (particularly for baby girls, to prevent spreading bacteria from the bowel to the urinary tract). Make sure you clean thoroughly within all the little skin folds and creases around the thighs and bottom. Pat the skin completely dry with a soft, clean towel before putting on a fresh nappy; do not rub, as rubbing can cause friction and chafing. Leave nappies slightly loose around the waist to allow fresh air to circulate and avoid rubbing against the healing umbilical cord stump. Allow a few minutes of nappy-free kicking time whenever possible to keep the skin healthy."
  },
  {
    source_id: "nhs-nappy-changing-hygiene",
    source_url: "https://www.nhs.uk/conditions/baby/caring-for-a-newborn/how-to-change-your-babys-nappy/",
    title: "Newborn Nappy Output: Normal Wet and Dirty Nappies",
    category: "newborn-care",
    chunk_index: 1,
    safety_relevant: true,
    chunk_text: "Monitoring your baby's nappies is one of the clearest and most reliable ways to check that they are well-hydrated, digesting properly, and getting enough milk. In the first 48 hours after birth, newborn babies pass dark, greenish-black, sticky meconium stools. Over the first few days, as milk intake increases, the stools change colour to greenish-brown and then, by day 5, transition to a mustard-yellow colour. Breastfed babies usually pass loose, yellow, seedy stools, whereas formula-fed babies tend to pass firmer, pale yellow or tan stools. From day 5 onwards, you should expect at least 6 heavy, wet nappies every 24 hours, filled with pale, odourless urine, alongside regular soft stools. If your baby has fewer than 6 wet nappies a day after day 5, passes dark concentrated yellow urine, shows brick-red urate powder or crystals in their nappy beyond the first few days, or seems unusually lethargic and sleepy during feeds, contact your midwife, health visitor, or NHS 111 promptly for feeding support and clinical assessment."
  },
  {
    source_id: "nhs-umbilical-cord-care",
    source_url: "https://www.nhs.uk/conditions/baby/caring-for-a-newborn/caring-for-a-newborn-baby/",
    title: "Caring for Your Newborn's Umbilical Cord Stump",
    category: "newborn-care",
    chunk_index: 0,
    safety_relevant: false,
    chunk_text: "Your newborn's umbilical cord stump will take around 1 to 2 weeks to dry out, turn dark brown or black, and fall off naturally on its own. The simplest and safest way to care for the cord stump is to keep it clean, dry, and exposed to the air as much as possible. Always wash your hands thoroughly with soap and warm water before touching the cord area or changing your baby's nappy. If the cord stump becomes soiled with urine or faeces, clean around the base gently using plain water and a piece of clean cotton wool, then pat it dry very gently with a fresh cotton pad or clean towel. Avoid using surgical spirits, antiseptics, or medicated powders on the stump, as plain water is best for natural healing. Fold the top front edge of your baby's nappy down below the stump so that fresh air can circulate freely around it and wet nappy waistbands do not rub or soak the area. Allow the cord stump to separate and drop off naturally; never pull, tug, or twist it, even if it appears to be hanging by a tiny thread."
  },
  {
    source_id: "nhs-umbilical-cord-care",
    source_url: "https://www.nhs.uk/conditions/baby/caring-for-a-newborn/caring-for-a-newborn-baby/",
    title: "Recognising Signs of Umbilical Cord Infection (Omphalitis)",
    category: "newborn-care",
    chunk_index: 1,
    safety_relevant: true,
    chunk_text: "While a small amount of dry crusting or an occasional tiny smear of dried blood on the nappy as the cord stump separates can be completely normal, parents should closely monitor the navel area for any signs of infection (omphalitis). In newborn infants, umbilical infections can spread quickly if left untreated, so early medical attention is important. Contact your GP, midwife, or NHS 111 immediately if you notice any of the following signs: spreading redness, warmth, or swelling on the skin around the base of the belly button; yellow, white, or greenish pus oozing from the stump; a strong, foul, or unpleasant odour coming from the cord area; active bleeding from the stump that does not stop after applying gentle pressure with a clean pad; or if your baby seems distressed, crying when you touch the skin around their tummy. Additionally, if your baby develops a fever of 38°C or higher, becomes floppy or unusually drowsy, or refuses feeds, seek urgent medical assessment immediately."
  },
  {
    source_id: "nhs-baby-dressing-temperature",
    source_url: "https://www.nhs.uk/conditions/baby/caring-for-a-newborn/keeping-your-baby-warm-or-cool/",
    title: "Dressing Your Baby for Room Temperature",
    category: "newborn-care",
    chunk_index: 0,
    safety_relevant: false,
    chunk_text: "Young babies cannot regulate their own body temperature as effectively as older children and adults, making them vulnerable to both getting too cold and overheating. The NHS and The Lullaby Trust recommend keeping the room where your baby sleeps at a comfortable, safe temperature between 16°C and 20°C (61°F to 68°F). A simple room thermometer in the bedroom helps you keep track of this easily. As a practical everyday rule of thumb, dress your baby in one more light layer of clothing than you would comfortably wear yourself in the same room. In a typical room of 18°C, a cotton vest (bodysuit) and a cotton sleepsuit (babygrow), combined with a lightweight baby sleeping bag of the appropriate tog rating (such as a 2.5 tog for standard room temperatures or 1.0 tog for warmer summer weather), are usually ideal. Never put hats, bonnets, hoods, or thick outdoor fleeces on your baby while they are sleeping indoors, as babies lose excess heat primarily through their head and face to prevent overheating."
  },
  {
    source_id: "nhs-baby-dressing-temperature",
    source_url: "https://www.nhs.uk/conditions/baby/caring-for-a-newborn/keeping-your-baby-warm-or-cool/",
    title: "Checking Baby's Temperature and Preventing Overheating",
    category: "newborn-care",
    chunk_index: 1,
    safety_relevant: true,
    chunk_text: "Overheating is a significant risk factor for Sudden Infant Death Syndrome (SIDS), so learning how to check your baby's temperature accurately is essential for safe sleep. To check whether your baby is too warm or too cool, place your clean hand gently on their chest or the back of their neck. Their skin should feel comfortably warm and dry to the touch. Do not judge your baby's body temperature by feeling their hands or feet; it is entirely normal for newborn hands and feet to feel cool to the touch due to their developing peripheral blood circulation. If your baby's chest or neck feels hot, damp, or clammy, remove one or more layers of blankets or clothing immediately to allow them to cool down. Common signs that a baby is uncomfortably hot include flushed red cheeks, damp hair or sweating around the neck, rapid breathing, heat rash (tiny red bumps), and fretful restlessness. Always keep cots and Moses baskets positioned well away from radiators, electric heaters, open fires, draughts, and direct sunlight."
  },
  {
    source_id: "nhs-holding-and-handling-newborn",
    source_url: "https://www.nhs.uk/conditions/baby/caring-for-a-newborn/holding-your-baby/",
    title: "Safe Handling, Head Support, and Bonding Holds",
    category: "newborn-care",
    chunk_index: 0,
    safety_relevant: false,
    chunk_text: "Newborn babies have relatively heavy heads and weak neck muscles, meaning they cannot support their own head for the first few months of life. Whenever you lift, hold, or carry your baby, it is essential to support their head and neck gently and securely. When picking your baby up from a cot or changing mat, slide one hand firmly under their head and neck, and slide your other hand underneath their bottom and lower back before lifting smoothly. Comforting holding positions include: the classic cradle hold, where your baby's head rests comfortably in the crook of your elbow while your forearm supports their back; the upright shoulder hold, with their head resting against your upper chest while you support their head with one hand; and the football (clutch) hold, where baby's body is tucked along your forearm. Newborns frequently experience the Moro (startle) reflex when they feel unsupported or when sudden movements occur; moving slowly, holding them close against your body, and speaking in a calm, soothing voice helps them feel secure and protected."
  }
];
