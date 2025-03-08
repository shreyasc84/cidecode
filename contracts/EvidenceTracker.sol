// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EvidenceTracker {
    struct Evidence {
        string caseId;
        string ipfsHash;
        string fileHash;
        address submittedBy;
        uint256 timestamp;
        bytes32 metadataHash;
        Status status;
        address[] accessHistory;
        mapping(uint256 => Action) actions;
        uint256 actionCount;
    }

    enum Status { Pending, Approved, Rejected }
    
    struct Action {
        address actor;
        string actionType;
        uint256 timestamp;
        string notes;
    }

    mapping(bytes32 => Evidence) public evidenceRecords;
    bytes32[] public evidenceIds;
    mapping(address => bool) public authorizedOfficers;
    address public admin;

    event EvidenceSubmitted(
        bytes32 indexed evidenceId,
        string caseId,
        address indexed submitter,
        uint256 timestamp
    );

    event EvidenceStatusChanged(
        bytes32 indexed evidenceId,
        Status newStatus,
        address indexed changedBy,
        uint256 timestamp
    );

    event ActionRecorded(
        bytes32 indexed evidenceId,
        address indexed actor,
        string actionType,
        uint256 timestamp
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == admin || authorizedOfficers[msg.sender],
            "Not authorized"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addOfficer(address officer) external onlyAdmin {
        authorizedOfficers[officer] = true;
    }

    function removeOfficer(address officer) external onlyAdmin {
        authorizedOfficers[officer] = false;
    }

    function submitEvidence(
        string memory caseId,
        string memory ipfsHash,
        string memory fileHash,
        bytes32 metadataHash
    ) external onlyAuthorized returns (bytes32) {
        bytes32 evidenceId = keccak256(
            abi.encodePacked(caseId, ipfsHash, fileHash, block.timestamp)
        );

        Evidence storage newEvidence = evidenceRecords[evidenceId];
        newEvidence.caseId = caseId;
        newEvidence.ipfsHash = ipfsHash;
        newEvidence.fileHash = fileHash;
        newEvidence.submittedBy = msg.sender;
        newEvidence.timestamp = block.timestamp;
        newEvidence.metadataHash = metadataHash;
        newEvidence.status = Status.Pending;
        
        evidenceIds.push(evidenceId);

        emit EvidenceSubmitted(evidenceId, caseId, msg.sender, block.timestamp);
        return evidenceId;
    }

    function updateEvidenceStatus(bytes32 evidenceId, Status newStatus)
        external
        onlyAdmin
    {
        Evidence storage evidence = evidenceRecords[evidenceId];
        require(evidence.timestamp != 0, "Evidence does not exist");
        
        evidence.status = newStatus;
        
        emit EvidenceStatusChanged(
            evidenceId,
            newStatus,
            msg.sender,
            block.timestamp
        );
    }

    function recordAction(
        bytes32 evidenceId,
        string memory actionType,
        string memory notes
    ) external onlyAuthorized {
        Evidence storage evidence = evidenceRecords[evidenceId];
        require(evidence.timestamp != 0, "Evidence does not exist");

        uint256 actionId = evidence.actionCount;
        evidence.actions[actionId] = Action({
            actor: msg.sender,
            actionType: actionType,
            timestamp: block.timestamp,
            notes: notes
        });
        evidence.actionCount++;
        evidence.accessHistory.push(msg.sender);

        emit ActionRecorded(evidenceId, msg.sender, actionType, block.timestamp);
    }

    function getEvidence(bytes32 evidenceId)
        external
        view
        returns (
            string memory caseId,
            string memory ipfsHash,
            string memory fileHash,
            address submittedBy,
            uint256 timestamp,
            bytes32 metadataHash,
            Status status,
            address[] memory accessHistory,
            uint256 actionCount
        )
    {
        Evidence storage evidence = evidenceRecords[evidenceId];
        require(evidence.timestamp != 0, "Evidence does not exist");

        return (
            evidence.caseId,
            evidence.ipfsHash,
            evidence.fileHash,
            evidence.submittedBy,
            evidence.timestamp,
            evidence.metadataHash,
            evidence.status,
            evidence.accessHistory,
            evidence.actionCount
        );
    }

    function getAction(bytes32 evidenceId, uint256 actionId)
        external
        view
        returns (
            address actor,
            string memory actionType,
            uint256 timestamp,
            string memory notes
        )
    {
        Evidence storage evidence = evidenceRecords[evidenceId];
        require(evidence.timestamp != 0, "Evidence does not exist");
        require(actionId < evidence.actionCount, "Action does not exist");

        Action memory action = evidence.actions[actionId];
        return (
            action.actor,
            action.actionType,
            action.timestamp,
            action.notes
        );
    }

    function getEvidenceCount() external view returns (uint256) {
        return evidenceIds.length;
    }
}
