// Takes when2meet script text as string and returns a
// mapped list of time slots with availability data
export const getSlotData = (content) => {
    const timeOfSlot = {};
    const availableAtSlot = {};

    // Regex is scary
    const timeRegex = /TimeOfSlot\[(\d+)\]=(\d+);/g;
    const availableSlotInitRegex = /AvailableAtSlot\[(\d+)\]=new Array\(\);/g;
    const availableSlotPushRegex = /AvailableAtSlot\[(\d+)\]\.push\((\d+)\);/g;

    let match;

    // Extract timeslot values
    while ((match = timeRegex.exec(content)) !== null) {
        const index = Number(match[1]);
        const timeValue = Number(match[2]);
        timeOfSlot[index] = timeValue;
    }

    // Initialize availableAtSlot arrays
    while ((match = availableSlotInitRegex.exec(content)) !== null) {
        const index = Number(match[1]);
        availableAtSlot[index] = new Array();
    }

    // Push availableAtSlot values
    while ((match = availableSlotPushRegex.exec(content)) !== null) {
        const index = Number(match[1]);
        const personID = Number(match[2]);
        if (availableAtSlot[index]) {
            availableAtSlot[index].push(personID);
        }
    }

    // Map together
    return Object.keys(timeOfSlot).map((key) => ({
        slot: Number(key),
        time: timeOfSlot[key],
        available: availableAtSlot[key] || []
    }));
};

// Takes when2meet script text as string and slot data
// returns a mapped list of all participant names and IDs
// that have filled out availability data 
export const getPeopleData = (content, slots) => {
    const peopleNames = [];
    const peopleIDs = [];

    // This took way to long to get right
    const nameRegex = /PeopleNames\[\d+\] = '([^']*)'/g;
    const idRegex = /PeopleIDs\[\d+\] = (\d+)/g;

    let match;

    // Extract names
    while ((match = nameRegex.exec(content)) !== null) {
        peopleNames.push(match[1]);
    }

    // Extract IDs
    while ((match = idRegex.exec(content)) !== null) {
        peopleIDs.push(Number(match[1]));
    }

    // Map together
    return peopleNames.map((name, index) => ({
        name,
        id: peopleIDs[index]
    })).filter((person) => slots.some(
        (slot) => slot.available.includes(person.id)
    ));
};